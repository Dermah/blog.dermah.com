# blog.dermah.com

Static site blog src for [blog.dermah.com](https://blog.dermah.com)

## Prerequisites

You need [git-lfs](https://git-lfs.github.com/)!

```bash
brew install git-lfs
git lfs install
```

To push and pull Git LFS objects (`*.jpg`, `*.png`), you may need to be running the local lfs server

```bash
npm run lfs-server
```

This assumes you have the AWS CLI and credentials configured for `--profile dermah`

## Clone

Using [my own lfs-server](https://blog.dermah.com/2020/05/26/how-to-be-stingy-git-lfs-on-your-own-s3-bucket/) has made this a chore. Just check out the lfs-server first:

```bash
git clone https://github.com/dermah/blog.dermah.com.git --no-checkout
cd blog.dermah.com
git checkout master package.json lfs-server/
```

Run the server in another terminal:

```bash
npm run lfs-server
```

Then check out everything else:

```bash
git checkout master .
```

## Install

```bash
npm install
```

## Dev

```bash
npm run serve
```

## Build

```bash
npm run build
```

## Deploy

```bash
npm run deploy -- --dryrun
npm run deploy
npm run decache
```

## [Release](https://github.com/Dermah/blog.dermah.com/releases)

Update the blog status, `git add` your changes then

```bash
npm version minor -f -m "<blog status>"
git push --follow-tags
```

## Other Stuff

### Stip metadata from all images in a directory

```bash
# brew install exiftool
exiftool -all= *.jpg
```

Recommended max dimension: 1500px
