const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    entry: './src/index.ts',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    watchOptions: {
      aggregateTimeout: 500,
      ignored: ['**/node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      libraryTarget: 'umd',
      library: 'E2',
      globalObject: 'this',
      filename: isProduction ? 'e2.min.js' : 'e2.js',
      path: path.resolve(__dirname, 'build'),
      clean: true,
    },
    optimization: {
      minimize: isProduction,
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    externals: [],
    devServer: {
      static: {
        directory: path.join(__dirname, 'resources'),
      },
      compress: true,
      port: 8080,
      open: true,
    },
  };
};
