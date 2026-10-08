import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

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
    path: path.resolve(__dirname, 'build'),
    // relative publicPath so the bundle works when served from a GitHub Pages project subpath
    publicPath: 'auto'
  },
  optimization: {
    splitChunks: {
      chunks: () => false
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      chunks: ['map'],
      inject: false
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
    extensions: ['.jsx', '.js'],
    alias: {
      // keep the dev build on the same reconciler as the ESM dist, which externalises preact
      react: path.resolve(__dirname, 'node_modules/preact/compat'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/preact/compat/client'),
      'react-dom': path.resolve(__dirname, 'node_modules/preact/compat'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/preact/jsx-runtime')
    }
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
