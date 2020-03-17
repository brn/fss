/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const iconFont = require("icon.font");
const fs = require("fs-extra");

iconFont({
  // Default options
  fontName: "icons",
  src: `${__dirname}/../svg`,
  dest: `${__dirname}/../font`,
  saveConfig: false,
  image: true,
  html: true,
  outputHtml: true,
  css: true,
  outputCss: true,
  fixedWidth: true,
  normalize: true,
  silent: true,
  types: ["woff2", "woff", "ttf", "eot", "svg"],
  templateOptions: {
    classPrefix: "_icon-",
    baseSelector: "._icon",
    baseClassname: "_icon"
  },
  codepointRanges: [
    [97, 122], // a-z
    [65, 90], // A-Z
    [48, 57], // 0-9
    [0xe001, Infinity]
  ]
}).then(function() {
  const src = `${__dirname}/../font`;
  const dest = `${__dirname}/../../web/icons`;
  fs.copySync(src, dest);
});
