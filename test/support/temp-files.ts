import fs from 'node:fs';
import path from 'node:path';
import temp from 'temp';

temp.track();

export function createTempTree(tree: Record<string, any>) {
  const enumNode = (parent: any, _tree: any) => {
    for (const [k, v] of Object.entries(_tree)) {
      const relPath = path.join(parent, k);
      if (typeof v === 'object') {
        fs.mkdirSync(relPath);
        enumNode(relPath, v);
      } else {
        fs.writeFileSync(relPath, '' + v);
      }
    }
  };
  const tempDir = temp.mkdirSync('ts-cleanup-test');
  enumNode(tempDir, tree);
  return tempDir;
}
