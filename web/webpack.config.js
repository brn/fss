/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webpack = require('webpack');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const PRODUCTION = process.env.NODE_ENV === 'production';
const E2E = process.env.NODE_ENV === 'debug-e2e';
const TS_CONFIG = fs.readFileSync('./tsconfig.json', 'utf8');
const BABEL_CONFIG = fs.readFileSync('./babel.config.js', 'utf8');

function digest(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}

module.exports = (env = {}) => {
  const config = {
    entry: {
      app: './src/index',
    },
    output: {
      path: `${__dirname}/dist`,
      filename: '[name].js',
      publicPath: '/',
      globalObject: 'this',
    },
    cache: true,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: ['node_modules'],
    },
    devtool: !PRODUCTION ? 'inline-source-map' : '',
    watchOptions: {
      ignored: /node_modules/,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': PRODUCTION
          ? '"production"'
          : E2E
          ? '"debug-e2e"'
          : '"debug"',
        'process.env.API_SERVER_URL': `"${process.env.API_SERVER_URL ||
          'http://localhost:8888'}"`,
      }),
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: PRODUCTION
          ? require('./dll/vendor.production-manifest.json')
          : require('./dll/vendor.development-manifest.json'),
      }),
      new SWPrecacheWebpackPlugin({
        cacheId: 'rs-swallow-admin',
        dontCacheBustUrlsMatching: /\.\w{8}\./,
        filename: 'sw.js',
        minify: PRODUCTION,
        staticFileGlobs: require('./sw-precache-static-files.json').files,
        mergeStaticsConfig: true,
        stripPrefixMulti: {
          dll: '',
          dist: '',
        },
        navigateFallback: '/index.html',
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      }),
    ],
    devServer: {
      contentBase: './dist/',
      inline: true,
      watchContentBase: true,
    },
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        {
          test: /\.tsx?$/,
          exclude: /node_modules|flycheck_.*/,
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheKey(options, request) {
                  const { cacheIdentifier, cacheDirectory } = options;
                  const hash = digest(
                    `${cacheIdentifier}\n${request}\n${TS_CONFIG}\n${BABEL_CONFIG}`,
                  );
                  return path.join(cacheDirectory, `${hash}.json`);
                },
              },
            },
            {
              loader: 'babel-loader',
            },
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.woff$/,
          loader:
            'url-loader?mimetype=application/font-woff&name=[path][name].[ext]',
        },
      ],
    },
  };
  return config;
};
