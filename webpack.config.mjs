import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  entry: {
    map: [
      path.join(__dirname, 'client/map/index.js')
    ]
  },
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build')
  },
  optimization: {
    splitChunks: {
      chunks: () => false
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  ignoreWarnings: [
    {
      /* ignore scss warnings for now */
      module: /\.scss/
    }
  ],
  target: ['web', 'es5'],
  performance: {
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
