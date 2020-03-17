/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const pkg = require('../package.json');
const fs = require('fs');
let cache;
try {
  cache = JSON.parse(fs.readFileSync('./.pacakge-deps-cache.json', 'utf8'));
} catch (e) {
  cache = {};
}

function checkDeps() {
  const deps = pkg.dependencies;
  const a = Object.keys(cache).sort();
  const b = Object.keys(deps).sort();
  for (let i = 0, len = b.length; i < len; i++) {
    if (a[i] !== b[i] || cache[a[i]] !== deps[b[i]]) {
      fs.writeFileSync(
        `${__dirname}/../.pacakge-deps-cache.json`,
        JSON.stringify(deps),
        'utf8',
      );
      process.exit(1);
    }
  }

  process.exit(0);
}

checkDeps();
