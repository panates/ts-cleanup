import * as path from 'path';
import * as fs from 'fs';
import * as fg from 'fast-glob';
import * as chokidar from 'chokidar';
import * as colors from 'colors';

declare type CleanCallback = (filename: string) => boolean;

export interface ICleanupOptions {
    root?: string;
    exclude?: string | string[];
    removeEmptyDirs?: boolean;
    verbose?: boolean;
}

export interface ICleanSrcOptions extends ICleanupOptions {
    removeAllJsFiles?: boolean;
}

export interface IWatchOptions {
    root?: string;
    verbose?: boolean;
}

const EXTENSIONS = ['.js', '.js.map', '.d.ts'];
const MATCH_TS_PATTERN = /^(.*)\.ts$/;

export function cleanup(src: string, dist: string, options: ICleanSrcOptions = {}, callback?: CleanCallback) {
    if (src) {
        cleanSrc({
            root: options.root ? path.resolve(options.root, src) : src,
            removeAllJsFiles: options.removeAllJsFiles,
            removeEmptyDirs: options.removeEmptyDirs,
            verbose: options.verbose
        }, callback);
    }
    if (dist) {
        cleanMatch('./**/*.{js,js.map,d.ts}', {
            root: options.root ? path.resolve(options.root, dist) : dist,
            removeEmptyDirs: options.removeEmptyDirs,
            verbose: options.verbose
        }, callback);
    }
}

export function watch(src: string, dist: string, options: IWatchOptions = {}, callback?: CleanCallback) {
    chokidar
        .watch(src, {
            persistent: true,
            cwd: src,
        })
        .on('unlink', filename => {
            // Check if it was a typescript file
            const match = filename.match(MATCH_TS_PATTERN);
            if (match) {
                const base = path.resolve(dist, match[1]);
                for (const ext of EXTENSIONS) {
                    const f = base + ext;
                    if (fs.existsSync(f) && (!callback || callback(f))) {
                        fs.unlinkSync(f);
                        if (options.verbose)
                            console.log(`Removed "${colors.yellow(f)}"`);
                    }
                }
            }
        });
    if (options.verbose)
        console.log(`Watching in "${colors.yellow(src)}"`);
}

export function cleanMatch(pattern: string | string[], options: ICleanupOptions = {}, callback?: CleanCallback) {

    const root = options.root as string;
    const verbose = options.verbose;

    _glob(root, pattern, (f) => {
        if ((!callback || callback(f))) {
            fs.unlinkSync(f);
            if (verbose) {
                console.log(`Removed file "${f}"`);
            }
        }
    }, options.exclude);

    if (options.removeEmptyDirs)
        _removeDir(root, verbose);
}

export function cleanSrc(options: ICleanSrcOptions, callback?: CleanCallback) {

    const root = options.root as string;
    const verbose = options.verbose;
    const removeFile = (f: string) => {
        if (!callback || callback(f)) {
            fs.unlinkSync(f);
            if (verbose)
                console.log(`Removed file "${f}"`);
        }
    };

    _glob(root, ['**/*.js'], (f) => {
        const base = f.substring(0, f.length - 3);
        if (!options.removeAllJsFiles &&
            !(fs.existsSync(base + '.ts') || fs.existsSync(base + '.tsx')))
            return;
        removeFile(f);
    }, options.exclude);

    _glob(root, ['**/*.{js.map,d.ts}'], (f) => {
        const ext = EXTENSIONS.find(x => f.endsWith(x)) as string;
        const base = f.substring(0, f.length - ext.length);
        if (fs.existsSync(base + '.js') &&
            !(fs.existsSync(base + '.ts') || fs.existsSync(base + '.tsx')))
            return;
        removeFile(f);
    }, options.exclude);

    if (options.removeEmptyDirs || options.removeEmptyDirs == null)
        _removeDir(root, verbose);
}

function _glob(cwd: string, pattern: string | string[],
               callback: (f: string) => void,
               exclude?: string | string[],) {
    const files = fg.sync(pattern,
        {
            cwd,
            onlyFiles: true,
            absolute: true,
            ignore: Array.isArray(exclude) ? exclude :
                (exclude ? [exclude] : undefined)
        });
    for (const f of files) {
        callback(f);
    }
}

function _removeDir(root: string, verbose?: boolean) {
    const files = fg.sync(`**/*`,
        {cwd: root, onlyDirectories: true});
    for (const f of files) {
        const relPath = path.join(root, f);
        if (!fs.readdirSync(relPath).length) {
            fs.rmdirSync(relPath);
            if (verbose)
                console.log(`Removed directory "${f}"`);
        }
    }
}
