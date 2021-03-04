const path = require( 'path' );
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const {styles} = require('@ckeditor/ckeditor5-dev-utils');
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = {
    plugins: [
        new CKEditorWebpackPlugin({
            language: 'en'
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        })
    ],

    entry: path.resolve( __dirname, 'src', 'entry.js' ),

    output: {
        // The name under which the editor will be exported.
        library: 'CKEDITOR',

        path: path.resolve( __dirname, 'build' ),
        filename: 'ckeditor.js',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },

    module: {
        rules: [
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                use: ['raw-loader']
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: styles.getPostCssConfig({
                            themeImporter: {
                                themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                            },
                            minify: true
                        })
                    }
                ]
            }
        ]
    }
};