/**
 * webpack config
 */
console.log('\nStart webpack to bundle entry javascript files...');

let createConfig = require('./config/creator');
let configs = require('./config/configs');

let optionArr = [];
Object.keys(configs).forEach(k => {
    let cfg = configs[k] || {};
    let {codeTreeShaking, entryPath, outLibrary, outFilename = k} = cfg;
    optionArr.push(createConfig({
        entry: {
            [k]: entryPath
        },
        outLibrary,
        outFilename: `${outFilename}.js`,
        codeTreeShaking
    }));
    optionArr.push(createConfig({
        entry: {
            [k]: entryPath
        },
        outLibrary,
        outFilename:  `${outFilename}.min.js`,
        codeTreeShaking,
        mode: 'production'
    }));
});

module.exports = optionArr;
