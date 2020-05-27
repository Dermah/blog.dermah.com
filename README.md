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

This assumes you have aws the AWS CLI and credentials configured for `--profile dermah`

## Install

Clone this! and then

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

## Release

Update the blog status, `git add` your changes then

```bash
npm version minor -f -m "<blog status>"
```
