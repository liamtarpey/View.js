var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist'
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCss: true,
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("style.css")
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
};
