const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'production',//'development',
  entry: {
    index: './src/js/index.js',
    soundImage: './src/js/soundImage.js',
    sw: './src/js/sw.js',
  },
  output: {
      filename: (pathData) => {
        return (pathData.chunk.name === 'sw' ? '': 'dist/') + '[name].bundle.js';
      },
      path: path.resolve(__dirname, '.'),
      // libraryTarget: 'window',
  },
  module: {
      rules: [
        {
          test: /\.vue$/i,
          loader: 'vue-loader',
        },
        // this will apply to both plain `.js` files
        // AND `<script>` blocks in `.vue` files
        {
          test: /\.js$/i,
          use: {
              loader: 'babel-loader',
              options: {
                  // presets: ['@babel/preset-react','@babel/preset-env'],
                  plugins: ['@babel/plugin-proposal-class-properties'],
              }
          }
        },
        // this will apply to both plain `.css` files
        // AND `<style>` blocks in `.vue` files
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            'css-loader',
          ]//use中所使用的loader的解析順序是由下至上(或由右至左)的
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        },
        {
          test: /\.s(c|a)ss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              // Requires sass-loader@^7.0.0
              options: {
                implementation: require('sass'),
                indentedSyntax: true // optional
              },
              // Requires sass-loader@^8.0.0
              options: {
                implementation: require('sass'),
                sassOptions: {
                  indentedSyntax: true // optional
                },
              },
            },
          ],
        },
      ]
  },
  plugins: [   
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',//少了這個，在網頁執行時，Vue就不會運作
      '@': resolve('src'),
    }
  }
};