const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');

module.exports = (env, argv) => {
    const isDev = argv.mode === 'development';

    return {
        mode: isDev ? 'development' : 'production',

        entry: './src/entry.js',

        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'ckeditor.js',
            library: {
                name: 'CKEDITOR',
                type: 'umd'
            },
            clean: true,
        },

        resolve: {
            extensions: ['.js'],
            mainFields: ['browser', 'module', 'main'],
            conditionNames: ['import', 'module', 'browser', 'default']
        },

        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: ['raw-loader']
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: styles.getPostCssConfig({
                                    themeImporter: {
                                        themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                                    },
                                    minify: !isDev
                                })
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'node_modules/ckeditor5/dist/translations/*.umd.js'),
                        to: ({ context, absoluteFilename }) => {
                            return `translations/${path.basename(absoluteFilename).replace('.umd', '')}`;
                        },
                        filter: (resourcePath) => resourcePath.endsWith('.js'),
                    }
                ]
            }),
            new MiniCssExtractPlugin({
                filename: 'styles.css'
            }),
        ],

        devtool: isDev ? 'source-map' : false,

        optimization: {
            minimize: !isDev,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                })
            ],
        },
    };
};
