const path = require('node:path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');

module.exports = (fixture, config = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: path.resolve(__dirname, fixture),
    output: {
      publicPath: config.publicPath ?? '',
      assetModuleFilename: 'assets/[name].[hash:8][ext]'
    },
    module: {
      rules: [
        {
          test: /\.(bin|png|jpe?g)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.gltf$/,
          use: {
            loader: path.resolve(__dirname, '../src/index.js'),
            options: config.options ?? {}
          }
        }
      ]
    }
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else if (stats.hasErrors()) {
        reject(stats.toJson().errors);
      } else {
        resolve(stats);
      }
    });
  });
};
