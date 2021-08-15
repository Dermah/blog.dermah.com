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

This assumes you have the AWS CLI and credentials configured. Try using [`aws-vault`](https://github.com/99designs/aws-vault) to manage many profiles.

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

## Pre-deploy File Diff

* Files present on S3 but not in `dist/` are red.
* New files to deploy to S3 are green.

```bash
npm run filediff
```

If you want to see the diff of the file contents:

```bash
npm run diff
# Or do this if you've already downloaded the bucket recently:
# npm run diff -- --show-only
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

---
## Infrastructure

You'll need the [AWS CLI](https://aws.amazon.com/cli/) installed and configured.

CloudFront can only use ACM certificates from the `us-east-1` region, so this stack must be deployed there. Set this environment variable to operate in `us-east-1`:

```bash
AWS_REGION=us-east-1
```

### Validate

```bash
aws cloudformation validate-template --template-body file://infrastructure.yml
```

### Create

```bash
# BYOHostedZoneID=<Existing Hosted Zone>
aws cloudformation create-stack --template-body file://infrastructure.yml --stack-name blog-dermah-com --parameters \
  ParameterKey=DomainName,ParameterValue=blog.dermah.com \
  ParameterKey=BYOHostedZoneID,ParameterValue=$BYOHostedZoneID
aws cloudformation wait stack-create-complete --stack-name blog-dermah-com
aws cloudformation describe-stacks --stack-name blog-dermah-com
```

### Diff
```bash
aws cloudformation get-template --stack-name blog-dermah-com --query TemplateBody --output text | git diff --no-index - infrastructure.yml
```
### Update

```bash
aws cloudformation update-stack --template-body file://infrastructure.yml --stack-name blog-dermah-com --parameters \
  ParameterKey=DomainName,UsePreviousValue=true \
  ParameterKey=BYOHostedZoneID,UsePreviousValue=true
aws cloudformation wait stack-update-complete --stack-name blog-dermah-com
```

### Describe

```bash
aws cloudformation describe-stacks --stack-name blog-dermah-com
aws cloudformation describe-stacks --stack-name blog-dermah-com --query "Stacks[0].Outputs"
aws cloudformation describe-stack-events --stack-name blog-dermah-com --query "StackEvents[*].{ID:LogicalResourceId,Type:ResourceType,Status:ResourceStatus,Time:Timestamp,Reason:ResourceStatusReason}"
```

---

## Writing

### Write a draft post

Do this in your post front matter
```yaml
draft: true        # removes the item from collections
permalink: false   # does not output the file during build
```