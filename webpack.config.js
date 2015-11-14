var devServer = require('webpack-dev-server');


module.exports = {
  entry: './index.js',
  output: {
    path: './',
    filename: 'encore.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader'}
    ]
  },
  resolve: {
    extensions: ['', '.js', '.less']
  }
};