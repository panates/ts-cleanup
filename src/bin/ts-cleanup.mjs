#!/usr/bin/env node
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import * as path from 'path';
// noinspection JSFileReferences
import { cleanup, watch } from '../esm/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgJson = JSON.parse(
  fs.readFileSync(path.resolve(dirname, '../package.json'), 'utf-8'),
);

program
  .name('ts-cleanup')
  .description(pkgJson.description)
  .usage('options')
  .option(
    '-s, --src <srcDir>',
    'sets the source folder with ts files (required if -d not defined)',
  )
  .option(
    '-d, --dist <distDir>',
    'sets the distribution folder with js files  (required if -s not defined)',
  )
  .option(
    '-v, --verbose',
    'whether to show messages for files being deleted (disabled by default)',
  )
  .option(
    '-w, --watch',
    'whether to watch for files being deleted (disabled by default)',
  )
  .option(
    '-a, --all',
    'whether to remove all .js,.js.map,d.ts files without a .ts file',
  )
  .option('-r, --remove-dirs', 'whether to remove empty directories', true)
  .option('-e, --exclude', 'sets excluded patterns')
  .version(pkgJson.version, '-V, --version', 'output the current version')
  .parse(process.argv);

function run() {
  const opts = program.opts();
  if (!(opts.src || opts.dist)) {
    program.outputHelp();
  }

  const root = process.cwd();
  const src = opts.src && path.resolve(root, opts.src);
  const dist = opts.dist && path.resolve(root, opts.dist);

  if (opts.watch) {
    if (src) {
      return console.error('Your must provide source directory to watch');
    }
    watch(src, dist || src, opts.verbose);
    return;
  }

  cleanup(opts.src, opts.dist, {
    root,
    removeAllJsFiles: opts.all,
    removeEmptyDirs: opts.removeDirs,
    verbose: opts.verbose,
    exclude: opts.exclude && undefined,
  });
}

run();
