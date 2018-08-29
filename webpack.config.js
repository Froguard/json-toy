/**
 * webpack config
 */
console.log('\nStart webpack to bundle entry javascript files success!');
let env = (process.env.WEBPACK_ENV||'').trim();
let ShakePlugin = require('webpack-common-shake').Plugin;
let path = require('path');
let outFilename = '[name].js';
let mode = 'development';
let isProd = env === 'build';
let devtool = false;
let minimize = false;
if(isProd){
    mode = 'production';
    outFilename = '[name].min.js';
    devtool = 'source-map';
    minimize = true;
}

let options = {
    entry: {
        'jsonToy': './index.js'
    },
    mode: mode,
    devtool: devtool,
	output: {
        path: path.join(__dirname, 'dist'),
	    filename: outFilename,
        library: '[name]',//['__api__','pages','[name]'] 方案二：''
        libraryTarget: 'umd',// 方案二：'var'
        globalObject: 'this'
	},
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',//need：babel-loader @babel/core @babel/preset-es2015
                        options: {
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        loose: true, // 转es5
                                        modules: false // 禁止babel将es6的module转化成commonjs
                                    }
                                ]
                            ],
                            comments: false
                        }
                    }
                ],
                exclude: /(node_modules|bower_components)/
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    // optimization: {
    //     minimize: minimize,
    //     sideEffects: true,
    //     // usedExports: false
    // },
    plugins: [
        new ShakePlugin({
            warnings: {
                global: true,
                module: false
            }
        })
    ]
};

module.exports = options;
