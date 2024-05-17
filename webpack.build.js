// @ts-nocheck
/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: './src/index.ts',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg|ttf)$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      _ASSETSPATH: JSON.stringify('https://s9.music.126.net/musicst/npm/react-monaco-editor-lite/1.2.3/'),
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          drop_console: true
        }
      },
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
};
