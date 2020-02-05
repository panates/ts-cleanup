# ts-cleanup

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

A helper script that can be used to cleanup previously transpiled typescript files. When typescript is setup to transpile files from a source to distribution folder, it won't automatically remove distribution files when their source file is deleted. ts-cleanup can take care of this task for you, both in single time build mode, or in watch mode.

## Installation

`$ npm install ts-cleanup --save`

## How to use it

```
Usage: ts-cleanup options

A tool for cleaning up files built by typeScript

Options:
  -s, --src <srcDir>    sets the source folder with ts files (required if -d not defined)
  -d, --dist <distDir>  sets the distribution folder with js files  (required if -s not defined)
  -v, --verbose         whether to show messages for files being deleted (disabled by default)
  -w, --watch           whether to watch for files being deleted (disabled by default)
  -k, --keep            whether to keep .js files without a .ts file
  -rd, --remove-dirs    whether to remove empty directories (default: true)
  -V, --version         output the current version
  -h, --help            output usage information
```

```shell script
ts-cleanup -s src -d dist -v -rd
```

## Node usage

ts-cleanup also provides two simple functions for usage from within a node script:

### Basic usage

`cleanup(src: string, dist: string, options?: ICleanSrcOptions);`

- `src`: the source folder with ts files (required if -d not defined)
- `dist`: the distribution folder with js files  (required if -s not defined)
- `options` 
    - `root?: string`: root directory
    - `exclude?: string | string[]`: pattern to exclude file matching
    - `removeEmptyDirs?: boolean`: whether to remove empty directories
    - `verbose?: boolean`: whether to show messages for files being deleted

```js
const {cleanup} = require("ts-cleanup");

cleanup('./src', "./dis", {
  root: __dirname, // default process.cwd()
  keepJsFilesWithoutTS: true, // default false
  removeEmptyDirs: true, // default false
  verbose: true // default false
});
```

```js
const {watch} = require("ts-cleanup");

watch('./src', "./dis", {
  root: __dirname, // default process.cwd()
  verbose: true // default false
});
```

`watch(src: string, dist: string, options?: IWatchOptions);`

- `src`: the source folder with ts files (required if -d not defined)
- `dist`: the distribution folder with js files  (required if -s not defined)
- `options` 
    - `root?: string`: root directory
    - `verbose?: boolean`: whether to show messages for files being deleted


### Advances usage


#### cleanSrc()

Cleans previously transpiled typescript files in a source directory.

`cleanSrc(options?: ICleanSrcOptions, callback?: (filename: string) => boolean);`

- `options` 
    - `root?: string`: root directory
    - `exclude?: string | string[]`: pattern to exclude file matching
    - `keepJsFilesWithoutTS?: boolean`: whether to keep .js files without a .ts file
    - `removeEmptyDirs?: boolean`: whether to remove empty directories
    - `verbose?: boolean`: whether to show messages for files being deleted
- `callback`: executes this callback for each file, and removes only files wich callback returns true. 

```js
const {cleanSrc} = require("ts-cleanup");

cleanSrc({
  root: __dirname, // default process.cwd()
  keepJsFilesWithoutTS: true, // default false
  removeEmptyDirs: true, // default false
  verbose: true // default false
},  (f)=> f.includes('.spec.ts'));
```

#### cleanMatch()

Cleans any files that matches glob pattern.

`cleanMatch(pattern: string | string[], options?: ICleanSrcOptions, callback?: (filename: string) => boolean);`

- `pattern`: Glob pattern to match files
- `options` 
    - `root?: string`: root directory
    - `exclude?: string | string[]`: pattern to exclude file matching
    - `removeEmptyDirs?: boolean`: whether to remove empty directories
    - `verbose?: boolean`: whether to show messages for files being deleted
- `callback`: executes this callback for each file, and removes only files wich callback returns true. 

```js
const {cleanMatch} = require("ts-cleanup");

cleanMatch('src/**/*.spec.{js,js.map,d.ts}', {
  root: __dirname, // default process.cwd()
  removeEmptyDirs: true, // default false
  verbose: true // default false
},  (f)=> !f.includes('.dont-remove'));
```

## Node Compatibility

  - node `>= 8.0`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/ts-cleanup.svg
[npm-url]: https://npmjs.org/package/ts-cleanup
[travis-image]: https://img.shields.io/travis/panates/ts-cleanup/master.svg
[travis-url]: https://travis-ci.org/panates/ts-cleanup
[coveralls-image]: https://img.shields.io/coveralls/panates/ts-cleanup/master.svg
[coveralls-url]: https://coveralls.io/r/panates/ts-cleanup
[downloads-image]: https://img.shields.io/npm/dm/ts-cleanup.svg
[downloads-url]: https://npmjs.org/package/ts-cleanup
[devdependencies-image]: https://david-dm.org/panates/ts-cleanup/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/ts-cleanup?type=dev
