const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const path = require('path')

module.exports = {
    entry: path.join(__dirname, 'src/js/app.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.[contenthash].js',
        assetModuleFilename: 'assets/img/[name][ext]',
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/pages', 'index.twig'),
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        // new ImageminWebpWebpackPlugin(),
    ],
    devServer: {
        watchFiles: path.join(__dirname, 'src'),
        port: 3000,
    },
    module: {
        rules: [
            {
                test: /\.twig$/,
                use: [
                    'html-loader',
                    {
                        loader: 'twig-html-loader',
                        options: {
                            data: (context) => {
                                const data = path.join(__dirname, 'data.json')
                                context.addDependency(data) // Force webpack to watch file
                                return context.fs.readJsonSync(data, { throws: false }) || {}
                            },
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(scss|css)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.svg$/,
                type: 'asset/resource',
                generator: {
                    filename: path.join('icons', '[name].[contenthash][ext]'),
                },
            },
            {
                test: /\.(woff2?|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.sharpMinify,
                    options: {
                        encodeOptions: {
                            encodeOptions: {
                                jpeg: {
                                    // https://sharp.pixelplumbing.com/api-output#jpeg
                                    quality: 100,
                                },
                                webp: {
                                    // https://sharp.pixelplumbing.com/api-output#webp
                                    lossless: true,
                                },
                                avif: {
                                    // https://sharp.pixelplumbing.com/api-output#avif
                                    lossless: true,
                                },

                                // png by default sets the quality to 100%, which is same as lossless
                                // https://sharp.pixelplumbing.com/api-output#png
                                png: {},

                                // gif does not support lossless compression at all
                                // https://sharp.pixelplumbing.com/api-output#gif
                                gif: {},
                            },
                        },
                    },
                },
                generator: [
                    {
                        // You can apply generator using `?as=webp`, you can use any name and provide more options
                        preset: 'webp',
                        implementation: ImageMinimizerPlugin.imageminGenerate,
                        options: {
                            plugins: ['imagemin-webp'],
                        },
                    },
                ],
            }),
        ],
    },
}
