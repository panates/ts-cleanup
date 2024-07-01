import { cleanMatch, cleanSrc } from 'ts-cleanup';
import * as fg from 'fast-glob';
import temp from 'temp';
import { createTempTree } from './support/temp-files.js';

describe('ts-cleanup', () => {
  let tempDir = '';
  let consoleBuf: string[];
  const orgConsole = console.log;

  function consoleMock(s: string) {
    consoleBuf.push(s);
  }

  afterEach(() => {
    temp.cleanupSync();
  });

  describe('test helpers', () => {
    it('should create temporary directory tree', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
          t1: {
            't1.js': '',
          },
        },
      });
      const files = fg.sync('**/*', { cwd: tempDir, onlyFiles: false });
      expect(files).toEqual([
        'src',
        'src/index.js',
        'src/index.md',
        'src/index.ts',
        'src/t1',
        'src/t1/t1.js',
      ]);
    });
  });

  describe('cleanSrc()', () => {
    it('should remove only files if a ts/tsx file exists', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.js.map': '',
          'index.d.ts': '',
          'main.js': '',
          'main.tsx': '',
          'other.js': '',
          'other.js.map': '',
          'other.d.ts': '',
        },
      });
      cleanSrc({ root: tempDir });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual([
        'src/index.ts',
        'src/main.tsx',
        'src/other.d.ts',
        'src/other.js',
        'src/other.js.map',
      ]);
    });

    it('should remove files only if a ts/tsx file exists', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.js.map': '',
          'index.d.ts': '',
          'main.js': '',
          'main.tsx': '',
          'other.js': '',
          'readme.md': '',
        },
      });
      cleanSrc({ root: tempDir, removeAllJsFiles: true });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual(['src/index.ts', 'src/main.tsx', 'src/readme.md']);
    });

    it('should exclude files matching glob pattern', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
          'other.ts': '',
          'other.js': '',
        },
      });
      cleanSrc({ root: tempDir, exclude: '**/other.*' });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual([
        'src/index.md',
        'src/index.ts',
        'src/other.js',
        'src/other.ts',
      ]);
    });

    it('should exclude files using callback', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
          'other.ts': '',
          'other.js': '',
        },
      });
      cleanSrc({ root: tempDir }, (f: string) => !f.includes('other'));
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual([
        'src/index.md',
        'src/index.ts',
        'src/other.js',
        'src/other.ts',
      ]);
    });

    it('should remove empty directories', () => {
      tempDir = createTempTree({
        src: {
          'index.md': '',
          t1: {},
        },
      });
      cleanSrc({ root: tempDir });
      const files = fg.sync('**/*', { cwd: tempDir, onlyFiles: false });
      expect(files).toEqual(['src', 'src/index.md']);
    });

    it('should verbose', () => {
      consoleBuf = [];
      console.log = consoleMock;
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          empty: {},
        },
      });
      cleanSrc({ root: tempDir, verbose: true, removeEmptyDirs: true });
      console.log = orgConsole;
      expect(consoleBuf.length).toEqual(2);
      expect(consoleBuf[0].startsWith('Removed file')).toBeTruthy();
      expect(consoleBuf[0].endsWith('/src/index.js"')).toBeTruthy();
      expect(consoleBuf[1].startsWith('Removed directory')).toBeTruthy();
    });
  });

  describe('cleanMatch', () => {
    it('should remove files matching glob pattern', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
        },
      });
      cleanMatch('**/*.{js,ts}', { root: tempDir });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual(['src/index.md']);
    });

    it('should remove files matching multiple glob pattern', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
        },
      });
      cleanMatch(['**/*.js', '**/*.ts'], { root: tempDir });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual(['src/index.md']);
    });

    it('should exclude files matching glob pattern', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
        },
      });
      cleanMatch('**/*.*', { root: tempDir, exclude: '**/*.md' });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual(['src/index.md']);
    });

    it('should exclude files matching multiple glob pattern', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
        },
      });
      cleanMatch('**/*.*', { root: tempDir, exclude: ['**/*.md', '**/*.js'] });
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual(['src/index.js', 'src/index.md']);
    });

    it('should exclude files using callback', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
          'other.ts': '',
          'other.js': '',
        },
      });
      cleanMatch(
        '**/*.*',
        { root: tempDir },
        (f: string) => !f.includes('other'),
      );
      const files = fg.sync('**/*', { cwd: tempDir });
      expect(files).toEqual(['src/other.js', 'src/other.ts']);
    });

    it('should remove empty directories', () => {
      tempDir = createTempTree({
        src: {
          'index.ts': '',
          'index.js': '',
          'index.md': '',
          t1: {
            't1.js': '',
          },
        },
      });
      cleanMatch('**/*.{js,ts}', { root: tempDir, removeEmptyDirs: true });
      const files = fg.sync('**/*', { cwd: tempDir, onlyFiles: false });
      expect(files).toEqual(['src', 'src/index.md']);
    });

    it('should verbose', () => {
      consoleBuf = [];
      console.log = consoleMock;
      tempDir = createTempTree({
        src: {
          'index.js': '',
          empty: {},
        },
      });
      cleanMatch('**/*', {
        root: tempDir,
        verbose: true,
        removeEmptyDirs: true,
      });
      console.log = orgConsole;
      expect(consoleBuf.length).toEqual(2);
      expect(consoleBuf[0].startsWith('Removed file')).toBeTruthy();
      expect(consoleBuf[0].endsWith('/src/index.js"')).toBeTruthy();
      expect(consoleBuf[1].startsWith('Removed directory')).toBeTruthy();
    });
  });
});
