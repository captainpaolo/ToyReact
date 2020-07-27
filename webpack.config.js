module.exports = {
    entry: {
        main: './main.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exlude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        [
                            '@babel/plugin-transform-react-jsx',
                            {
                                pragma: 'ToyReact.createElement'
                            }
                        ]
                    ]
                }
            }
        }]
    },
    mode: 'development',
    optimization: {
        minimize: false
    }
}