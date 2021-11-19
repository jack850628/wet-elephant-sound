const path = require('path');
function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
    mode: 'production',//'development',
    entry: {
      index: './src/js/index.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './dist'),
        libraryTarget: 'window',
    },
    module: {
        rules: [
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
          }
        ]
    },
    plugins: [   
    ],
    resolve: {
        alias: {
          '@': resolve('src'),
        }
      }
};