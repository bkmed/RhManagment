const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './index.server.js',

  target: 'node',

  externalsPresets: { node: true },
  externals: [nodeExternals()],

  output: {
    path: path.join(__dirname, './server-build'),
    filename: 'index.js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      { test: /\.(scss|css)$/, loader: 'ignore-loader' },
    ],
  },
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.done.tap('done', stats => {
          console.info('webpack compiler done');
          if (stats.compilation.errors.length > 0) {
            throw new Error(
              stats.compilation.errors.map(err => err.message || err),
            );
          }
          setTimeout(() => {
            process.exit(0);
          });
        });
      },
    },
    new CleanWebpackPlugin(),
  ],
};
