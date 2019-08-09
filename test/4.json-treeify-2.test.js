let fs = require('fs');
let path = require('path');
let should = require('should');
let treeStr = require('../lib/json-treeify');
let tcPath = path.join(__dirname, './test-cases');
let testCaseDir = fs.readdirSync(tcPath);
let opts = {
    rootName: 'ROOT',
    space: 3,
    vSpace: 1,
    valueOut: true
};
let ioMap = [];//输入输出检查
testCaseDir.forEach((item) => {
    if(path.extname(item).match(/(\.json)$/i)){
        let key = path.basename(item);
        key = key.substring(0, key.lastIndexOf('.'));
        delete require.cache[require.resolve(path.join(tcPath, item))];
        let json, aTxt, eTxt;
        try{
            json = require(path.join(tcPath, item));
            aTxt = treeStr(json, opts);
        }catch(e1){
            aTxt = false;
        }
        try{
            eTxt = fs.readFileSync(path.join(tcPath, `${key}.txt`), 'utf-8').toString();
        }catch(e2){
            eTxt = false;
        }
        ioMap.push({
            key,
            resExpect: eTxt && eTxt.replace(/\r/g, ''),
            resActual: aTxt && aTxt.replace(/\r/g, '')
        });
    }
});

describe('Test \'./lib/json-treeify.js result values\':', () => {
    ioMap.forEach((item) => {
        if(!!item.resExpect && !!item.resActual){
            it(`return correct string after converting json to treeString: '${`${item.key}.json`} <=> ${`${item.key}.txt`}'`, function(done) {
                should.deepEqual(item.resExpect, item.resActual);
                done && done.call(this);
            });
        }
    });
});

