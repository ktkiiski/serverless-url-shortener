# Broilerplate

![Broilerplate](./src/images/broilerplate.png)

This is a boilerplate for creating projects that use Webpack 2 to compile a TypeScript application and SASS stylesheets into a ES5 JavaScript and CSS.

Features:

- Write your scripts in [TypeScript](http://www.typescriptlang.org/)
- Write your stylesheets in [SASS](http://sass-lang.com/)
- Generate static HTML pages from [Pug](https://pugjs.org/) templates
- Automatically include any images from your HTML, Pug, or Markdown files.
- Include Markdown to your Pug templates. You may [include with filters](https://pugjs.org/language/includes.html#including-filtered-text) but `!= require("foo.md")` is preferred because it will also require any images.

To apply this template:

```bash
git remote add template https://github.com/ktkiiski/broilerplate.git
git pull template master
```

Remember to add your project metadata to the [`package.json`](./package.json), for example, `name`, `author`, `description`.

## Setup

You need to install the required node packages:

```bash
npm install
```

If installing fails on OSX [you may try to install libpng with Homebrew](https://github.com/tcoopman/image-webpack-loader#libpng-issues).


## Run locally

To run the app locally, start the local HTTP server and the build watch process:

```bash
npm start
```

Then navigate your browser to http://0.0.0.0:1111/

The web page is automatically reloaded when the app is re-built.

## Build

The built files are placed to a `dist` folder, located at the root of your project.
To build the files for development, run:

```bash
npm run build:dev
```

To build for production:

```bash
npm run build:prod
```
