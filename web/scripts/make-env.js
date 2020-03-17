/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const pkg = require('../package.json');
const crypto = require('crypto');
const fs = require('fs');
const glob = require('glob');
const md5hex = function(src) {
  var md5hash = crypto.createHash('md5');
  md5hash.update(src, 'binary');
  return md5hash.digest('hex');
};

console.log(
  JSON.stringify({
    env: process.env.NODE_ENV || 'production',
    hash: md5hex(
      glob
        .sync('dist/**/*')
        .filter(v => !fs.statSync(v).isDirectory())
        .concat(['dll/vendor.production.dll.js'])
        .reduce((buf, file) => {
          return Buffer.concat([buf, fs.readFileSync(file)]);
        }, Buffer.alloc(0, '')),
    ),
    polyfillFeatures: 'default-3.4,fetch,es2015,es2016,es2017,es2018',
  }),
);
