const fs = require('fs');
const path = require('path');
const temp = require('temp');

temp.track();

function createTempTree(tree) {

  const enumNode = (parent, tree) => {
    for (const [k, v] of Object.entries(tree)) {
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

module.exports = {createTempTree};
