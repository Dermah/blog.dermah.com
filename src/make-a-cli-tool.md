# How to make a node-based CLI tool

If you have a local repo you use all the time that would be useful as a global command line utility, this is for you. In this example, we're going to create a command line utility called `blerp`

## Add a CLI entrypoint file to your package

Call it something like `cli.js`. It should look like this:

```js
#!/usr/bin/env node

console.log("Hello!");
```

## Tell npm your package has an executable entrypoint

In your `package.json`, add this:

```json
"bin" : { "blerp" : "./cli.js" }
```

## Install your package globally

Do this:

```sh
npm install -g
```

Now you can do this:

```console
$ blerp
> Hello!
```
