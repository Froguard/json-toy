/**
 * webpack config
 */
console.log('\nStart webpack to bundle entry javascript files success!');
var env = (process.env.WEBPACK_ENV||'').trim();
var webpack = require('webpack');
var plugins = [];
var outFilename = "[name].js";
if(env === 'build'){
    // compress
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false  // remove comments
        },
        compress: {
            warnings: false
        },
        minimize : true,
        except: ['$super', '$', 'exports', 'require']
    }));
    outFilename = "[name].min.js";
}

var options = {
    entry: {
        "jsonToy": "./index.js"
    },
	output: {
	    path: "./dist",
	    filename: outFilename,
        library: "[name]",//['__api__','pages','[name]'] 方案二：""
        libraryTarget: 'umd'// 方案二："var"
	},
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',//need：babel-loader babel-core
                // query: {
                //     presets: ['es2015']
                // },
                exclude: /(node_modules)/
            }
        ]
    },
    resolve:{
        extensions:["",".js"]
    },
    plugins:plugins
};

module.exports = options;
