/**
 * webpack config
 */
console.log('\nStart webpack to bundle entry javascript files...');

let createConfig = require('./creator');
let configs = require('./configs');

let optionArr = [];
for (let [k, cfg] of Object.entries(configs)){
    let {codeTreeShaking, entryPath, outLibrary, outFilename = k} = cfg || {};

    console.log({[k]: `${outFilename}.js, ${outFilename}.min.js`});

    // normal
    optionArr.push(createConfig({
        entry: {[k]: entryPath},
        outLibrary,
        outFilename: `${outFilename}.js`,
        codeTreeShaking
    }));
    // minify
    optionArr.push(createConfig({
        entry: {[k]: entryPath},
        outLibrary,
        outFilename: `${outFilename}.min.js`,
        codeTreeShaking,
        mode: 'production'
    }));
}

module.exports = optionArr;
