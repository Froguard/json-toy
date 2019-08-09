/**
 * webpack config
 */
let webpack = require('webpack');
let ShakePlugin = require('webpack-common-shake').Plugin;
let path = require('path');
let BannerPlugin = webpack.BannerPlugin;

module.exports = function createConfig(option) {
    let {entry, outFilename, outLibrary, codeTreeShaking, mode} = option || {};
    let plugins = [new BannerPlugin({
        banner: 'Froguard(figure_wf@163.com)\nhttps://github.com/Froguard/json-toy\nlicense MIT',
        entryOnly: true
    })];
    let devtool = false;
    if (codeTreeShaking) {
        plugins = plugins.concat(new ShakePlugin({
            warnings: {
                global: true,
                module: false
            }
        }));
    }
    // export webpack config
    return {
        mode: mode || 'development',
        entry,
        devtool,
        plugins,
        output: {
            path: path.join(__dirname, '../dist'),
            filename: outFilename,
            library: outLibrary || '[name]', //['__api__','pages','[name]'] 方案二：''
            libraryTarget: 'umd', // 方案二：'var'
            globalObject: 'this'
        },
        module: {
            rules: [{
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader', //need：babel-loader @babel/core @babel/preset-es2015
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    loose: true, // 转es5
                                    modules: codeTreeShaking ? false : 'commonjs' // true-转换module, false-禁止babel将es6的module转化成commonjs
                                }
                            ]
                        ],
                        comments: false
                    }
                }],
                exclude: /(node_modules|bower_components)/
            }]
        },
        resolve: { extensions: ['.js'] },
        // optimization: {
        //     minimize: minimize,
        //     sideEffects: true,
        //     // usedExports: false
        // },
    };
};
