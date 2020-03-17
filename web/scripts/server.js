/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const fs = require('fs');
const express = require('express');
const childProcess = require('child_process');
const serveStatic = require('serve-static');
const http = require('http');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const ejs = require('ejs');
const config = {
  ...require('../webpack.config.js')({}),
};
config.output.publicPath = '/assets/';
const serve = serveStatic(`${__dirname}/../`);
const app = express();
config.output.path = '/';
config.bail = false;
config.mode = 'development';
const compiler = webpack(config);
const devHtmlName = `index.debug.html`;
let devHtml;
childProcess.exec(`node ${__dirname}/make-env`, (err, data) => {
  if (err) {
    throw err;
  }
  devHtml = ejs.render(
    fs.readFileSync(`${__dirname}/../${devHtmlName}`, 'utf8'),
    { ...JSON.parse(data), env: process.env.NODE_ENV },
  );
});

try {
  if (
    String(process.env.PID) !==
    fs.readFileSync(`${__dirname}/../.dev.pid`, 'utf8')
  ) {
    throw new Error(
      "Old server process exists.\nKill old process by 'npm run stop-dev' or 'gulp stop-serve'",
    );
  }
} catch (e) {}

app.use(serve);
app.use(
  webpackDevMiddleware(compiler, {
    hot: true,
    inline: true,
    publicPath: config.output.publicPath,
    stats: { colors: true },
  }),
);
app.get('/', (req, res) => {
  res.send(devHtml);
});
app.get('/sw-hash.js', (req, res) => {
  res.setHeader('content-type', 'application/javascript');
  res.send('');
});
app.get('/sw.js', (req, res) => {
  res.setHeader('content-type', 'application/javascript');
  res.send(fs.readFileSync(`${__dirname}/../dist/sw.js`, 'utf8'));
});
app.get('/vendor.production.dll.js', (req, res) => {
  res.setHeader('content-type', 'application/javascript');
  res.send(
    fs.readFileSync(`${__dirname}/../dll/vendor.production.dll.js`, 'utf8'),
  );
});
app.get('/vendor.development.dll.js', (req, res) => {
  res.setHeader('content-type', 'application/javascript');
  res.send(
    fs.readFileSync(`${__dirname}/../dll/vendor.development.dll.js`, 'utf8'),
  );
});

http.createServer(app).listen(8080, () => {
  console.log('nHTTPServer started 8080 port.');
  fs.writeFileSync(`${__dirname}/../.dev.pid`, process.env.PID, 'utf8');
});
