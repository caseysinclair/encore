module.exports = {
  entry: './mixer.js',
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