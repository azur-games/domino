const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: './testPage/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "dist")
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "testPage",
          to: path.resolve(__dirname, 'dist')
        }
      ],
    }),
    new WatchExternalFilesPlugin({
      files: [
        path.resolve(__dirname, "../testPage/*.css"),
        path.resolve(__dirname, "../testPage/*.html")
      ],
      
    }),
  ],
  optimization: {
    minimize: false
  },
  resolve: {
    alias: { // fix duplicates
      lodash: path.resolve(__dirname, 'node_modules/lodash'),
      eventemitter3: path.resolve(__dirname, 'node_modules/eventemitter3'),
      "core-js":  path.resolve(__dirname, 'node_modules/core-js'),
     // "core-js-pure":  path.resolve(__dirname, 'node_modules/core-js-pure'),
    }, 
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [              
              ["@babel/env", {
                 "useBuiltIns": "usage",
                 "corejs": '2.6.5'
              }]
            ],
            plugins: [
              "@babel/plugin-proposal-nullish-coalescing-operator",
              "@babel/plugin-proposal-class-properties",
              //"@babel/plugin-transform-classes",
              //"@babel/plugin-transform-spread"
            ],
          },          
        }       
      },
    ],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 1024*1024,
    maxAssetSize: 1024*1024
  },
  devtool: "source-map",
  stats: 'errors-only',
  devServer: {
    hot: true,
    liveReload: true,
    //writeToDisk: true,
    watchFiles: {
      paths: ["src/**/*", "testPage/*"],
    }
  },
  cache: false
};