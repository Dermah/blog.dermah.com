---
title: How to make a node-based CLI tool
layout: post
comments:
  tweet:
    id: "1194599024201891841"
    text: In today&#39;s very minor blog release, I&#39;ve updated the blog code to allow nice permalinking directly to posts (wow). Which means I can link to the initial post about how to make a <a href="https://twitter.com/hashtag/nodejs?src=hash&amp;ref_src=twsrc%5Etfw">#nodejs</a> command line utility. Please note it still looks archaic. <a href="https://t.co/p27EdXfYeU">https://t.co/p27EdXfYeU</a>
    dateString: November 13, 2019
---

If you have a local repo you use all the time that would be useful as a global command line utility, this is for you! In this example, we're going to create a command line utility called `blerp`.

<!-- excerpt -->

### Add a CLI entrypoint file to your package

Call it something like `cli.js`. It should look like this:

```js
#!/usr/bin/env node

console.log(`Hello! Command is ${process.argv[2]}`);
```

### Tell npm your package has an executable entrypoint

In your `package.json`, add this:

```json
"bin" : { "blerp" : "./cli.js" }
```

### Install your package for use anywhere

Do this:

```bash
npm link
```

Now you can do this:

```shell-session
$ blerp flerp
> Hello! Command is flerp
```
