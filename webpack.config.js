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
            },
            {
                test: /\.s[a|c]ss$/,
                loader: 'style!css!sass'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("style.css")
    ],
    // vue: {
    //     loaders: {
    //         scss: 'style!css!sass'
    //     }
    // }
    // resolve: {
    //     alias: {
    //         vue: 'vue/dist/vue.js'
    //     }
    // }
};
