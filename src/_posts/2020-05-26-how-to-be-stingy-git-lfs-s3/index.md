---
title: "How To Be Stingy: Git LFS On Your Own S3 Bucket"
layout: post
---

Being extremely stingy, I didn't want to use up any [Github Large File Storage quota](https://help.github.com/en/github/managing-large-files/about-storage-and-bandwidth-usage) on images/photos for this blog. Part of the reason for that is my delusion future-proofing (what if one day I've written so many posts that I have too many images here and I'll have to pay \$60 a year for extra storage argh). Lucky for me, it's possible to use S3 as a backend for LFS files while still using Github to store the code part of the repo.

<!-- excerpt -->

### Alternatives

Getting to this decision was a roundabout process. Alternatives I considered included:

- Just have the images sitting somewhere else on the hard drive/internet and symlinking them. A simple solution that doesn't really gel with my overreliance on automation and tooling. If I don't have the process documented somewhere, I'm going to forget it.
- [`git-portal`](https://gitlab.com/slackermedia/git-portal) ([detailed in an article here](https://opensource.com/article/19/4/manage-multimedia-files-git)). This uses commit hooks and symlinks to move large files out of the way just before you commit them. It was a cute idea, but unfortunately it didn't work on my OS.
- [`git-annex`](https://git-annex.branchable.com). It seems like a fancy and complicated version of `git-portal`. It's so fancy it has it's own [wikipedia page](https://en.wikipedia.org/wiki/Git-annex) and [Kickstarter campaign](https://www.kickstarter.com/projects/joeyh/git-annex-assistant-like-dropbox-but-with-your-own). It seems to have the concept of multiple remotes that can go offline. At this point I realised that Git LFS probably uses different remotes under the hood, since regular git servers don't have LFS support enabled.

After some random googling, I finally found [this article that outlines how to use `node-git-lfs` to proxy LFS files to S3](https://www.imakewebsites.ca/posts/2017/02/08/host-your-own-git-lfs-with-node-lfs-s3/). Exactly what I wanted! So here's how I set it up with this blog:

### Prerequisites

You'll need:

- An [AWS account](https://aws.amazon.com/)
  - with [an S3 bucket](https://aws.amazon.com/s3/) set up
  - with the AWS CLI [installed](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) on your machine
- A Github repo you can write to, cloned on your machine. (Or any other hosted git repo will work too: Bitbucket, GitLab etc.)
- [node.js](https://nodejs.org/en/) installed

### Install `git-lfs`

If you haven't already, now's the time to install the `git-lfs` extension for `git`. I'm on macOS so i did it with [Homebrew](https://brew.sh/) like this:

```bash
brew install git-lfs
```

There's instructions for other OSs [on the `git-lfs` website](https://git-lfs.github.com/).

Install the extension with:

```bash
git lfs install
```

To check it's installed, you can just run `git lfs` to get version and usage info.

### Configure your git repo to use Git LFS

In my git repo, I wanted to track all `jpg` and `png` files with Git LFS. You can do that with the following (don't forget the quotes `""` or bash will try and do some [filename expansion](https://www.tldp.org/LDP/abs/html/globbingref.html)):

```bash
git lfs track "*.jpg"
git lfs track "*.png"
```

That just created a new `.gitattributes` file:

```properties
*.jpg filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
```

that tells git to use `git-lfs` when those kinds of files are added to the repo. You'll want to commit this file.

Ok, all of that was in the Git LFS README. Now for the fancy bit:

### Run a server to proxy LTS files to an S3 bucket

We're going to use this nice package [kzwang](https://github.com/kzwang/node-git-lfs) made called [`node-git-lfs`](https://github.com/kzwang/node-git-lfs). Basically it starts a server on your computer that adhears to the [Git LFS API spec](https://github.com/git-lfs/git-lfs/tree/master/docs/api). That means your `git-lfs` client can talk to it properly. This server will recieve the files sent to it by the `git-lfs` client and, after we configure it to do so, will store them in S3.

Since I'm going to use this server a lot (every time I push images to the blog) I decided to save as much configuration to the blog code as possible. In the blog directory I made an `lfs-server/` folder.

You can try starting the server straight away using [npx](https://github.com/npm/npx#readme) (which comes with node.js):

```shell-session
$ npx node-git-lfs
WARNING: No configurations found in configuration directory:~/projects/blog.dermah.com/config
WARNING: To disable this warning set SUPPRESS_NO_CONFIG_WARNING in the environment.
```

This doesn't work because the server needs a [bunch of not-too-well-documented configuration](https://github.com/kzwang/node-git-lfs#configuration) before it will work. It actually uses the [`node-config`](https://lorenwest.github.io/node-config/) package, so I saved all configuration that doesn't have secrets in it to `lfs-server/config/default.json`:

```json
{
  "base_url": "http://localhost:9999/",
  "port": 9999,
  "private": false,
  "authenticator": {
    "type": "none",
    "options": {}
  },
  "ssh": {
    "enabled": false
  },
  "store": {
    "type": "s3",
    "options": {
      "bucket": "blog.dermah.com",
      "region": "ap-southeast-2"
    }
  }
}
```

This tells `node-git-lfs` to start the LFS server on `http://localhost:9999` without any encryption or authorisation. I'm assuming this will be ok because I will only run the server locally when pushing and pulling the repo. Don't use these settings in production!

The `"store"` key tells the server which S3 bucket it should store the files on. It will only be able to do this if it has the right AWS authorisation keys. Those keys are not in this file, because they're a secret and I am committing this file to a public repository. To make sure only I can push to this bucket, I've added this script at `lfs-sevrer/server.sh`:

```bash
#!/bin/sh

AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id) \
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key) \
npx node-git-lfs
```

This script first gets the AWS credentials from the AWS CLI, and uses them to set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables. You can add `--profile <profile-name>` to the commands if you use multiple AWS profiles.

Those environment variables are given to the `npx node-git-lfs` command, and are consumed by the [AWS SDK for Node.js](https://aws.amazon.com/sdk-for-node-js/) that the server uses. Now the server is fully configured with all the info it needs to store files on S3. If you run the script, you should see something like:

```shell-session
$ cd lfs-server/
$ ./server.sh
Listening LFS on port 9999
```

Now your server is ready for a `git-lfs` client to connect to it. The last thing to do is:

### Configure the repo to use your local server

All you need to do is make a `.lfsconfig` file in the base of your git repo with something like:

```properties
[lfs]
url = "http://localhost:9999/git-lfs/blog.dermah.com.git"
```

This tells `git-lfs` to use the server running on yor computer for the LFS plugin. The server will store your files in the bucket at the prefix `/git-lfs/blog.dermah.com.git` so change that to whatever you like, as long as it's in the format `/:user/:repo` ([a requirement of the server package at the moment](https://github.com/kzwang/node-git-lfs/blob/f80acbf3c2d74d9278226b5c84b2d003ff3e3aa5/lib/routes/objects.js#L44)). Now it's time to:

### Commit a picture to your repo

Add the image file as you normally would:

```bash
git add src/_posts/2020-05-26-how-to-be-stingy-git-lfs-s3/2020-05-26-nexus-6p-destroyed.jpg
```

You can tell it's tracked by LFS using `git lfs status` and checking the `LFS` tag after the filename:

```shell-session
$ git lfs status
On branch master
Objects to be pushed to origin/master:

Objects to be committed:

        src/_posts/2020-05-26-how-to-be-stingy-git-lfs-s3/2020-05-26-nexus-6p-destroyed.jpg (LFS: 19f2dcd)
```

Commit and push!

```shell-session
$ git commit -m "Add example photo"
[master 08ed873] Add example photo
 1 file changed, 3 insertions(+)
 create mode 100644 src/_posts/2020-05-26-how-to-be-stingy-git-lfs-s3/2020-05-26-nexus-6p-destroyed.jpg
$ git push
Uploading LFS objects: 100% (1/1), 387 KB | 0 B/s, done.
Enumerating objects: 21, done.
Counting objects: 100% (21/21), done.
Delta compression using up to 8 threads
Compressing objects: 100% (15/15), done.
Writing objects: 100% (16/16), 5.21 KiB | 2.61 MiB/s, done.
Total 16 (delta 8), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (8/8), completed with 4 local objects.
To https://github.com/Dermah/blog.dermah.com.git
   4622011..08ed873  master -> master
```

You'll notice the server you started earlier handled those requests:

```shell-session
Listening LFS on port 9999
POST /git-lfs/blog.dermah.com.git/objects/batch [m[1;32m200[m 21.049 ms - 410
PUT /git-lfs/blog.dermah.com.git/objects/19f2dcd3b4f260b2d6e5cdec56c58d2b150526b262cb0ca15b8d86eb6398d3dd [m[1;32m200[m 316.313 ms - 2
POST /git-lfs/blog.dermah.com.git/objects/verify [m[1;32m200[m 75.374 ms - 2
```

(Check out [kzwang/node-git-lfs#5](https://github.com/kzwang/node-git-lfs/issues/5) if this hasn't worked for you, you may need to update some code inside the server since this package is a bit old)

Now we have this picture of a demolished Nexus 6P in all it's glory in the repository!

![A Nexus 6P phone lays smashed to smithereens on a concrete pavement. Green pieces of electronic component board are smashed up and scattered around. The phone screen appears more like the surface of a cheese grater.](/img/2020-05-26-nexus-6p-destroyed.jpg)

### The End

Check out [all the code I used for the LFS server on this blog's Github repo](https://github.com/Dermah/blog.dermah.com/tree/4622011cf54f173d1f59b854609ca14ec2135bdb/lfs-server).
