/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const path = require('path');
const webpack = require('webpack');

const PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    [PRODUCTION ? 'vendor.production' : 'vendor.development']: Object.keys(
      require('./package.json').dependencies,
    ),
  },
  devtool: !PRODUCTION ? 'inline-source-map' : '',
  output: {
    filename: '[name].dll.js',
    path: `${__dirname}/dll`,
    library: 'vendor_library',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: PRODUCTION,
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: 'vendor_library',
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': PRODUCTION ? '"production"' : '"debug"',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            'babel-preset-power-assert',
          ],
          plugins: ['@babel/plugin-proposal-class-properties'],
        },
      },
    ],
  },
};
