---
title: How to make a node-based CLI tool
layout: post
---

If you have a local repo you use all the time that would be useful as a global command line utility, this is for you! In this example, we're going to create a command line utility called `blerp`

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
