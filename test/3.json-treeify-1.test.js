let should = require('should');
let treeStr = require('../lib/json-treeify');
// correct
let testJson = {
    "x":{
        "y":[
            0,
            1,
            {
                "z": "helloZ中文中文中文中文中文中文"
            },
            [
                0,
                1,
                2,
                3
            ]
        ],
        "z": function(a){}
    }
};

// circularObj 循环自引用
let circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [ circularObj, circularObj ];
circularObj.a = {b:circularObj};


describe("Test './lib/json-treeify.js':", function() {

    it("convert json to tree-string without throwing error, and return a string", function(done) {
        should.doesNotThrow(function(){
            treeStr('');
            treeStr();
            treeStr(null);
            treeStr(undefined);
        });

        should.doesNotThrow(function(){
            treeStr(testJson, {space: '\t'});
        });

        should.doesNotThrow(function(){
            treeStr(testJson, {needValueOut: false, vSpace: -1, space: -1, jsonName: ''});
        });

        should.doesNotThrow(function(){
            treeStr(testJson, {needValueOut: false, vSpace: 4, space: 9, jsonName: ''});
        });

        should.doesNotThrow(function(){
            treeStr(testJson, {needValueOut: false, vSpace: NaN, space: 9, jsonName: ''});
        });

        should.equal("string", typeof treeStr(testJson, null));

        should.equal(true, treeStr(testJson, {msReturnChar: true}).includes('\r'));
        
        done && done.call(this);
    });

    it("convert a circularObj to tree-string without throwing error", function(done) {
        should.doesNotThrow(function(){
            treeStr(circularObj);
        });

        done && done.call(this);
    });

    it("undefined,null,primitive type return a string", function(done) {
        should.equal("string",typeof treeStr(1));
        should.equal("string",typeof treeStr({}));
        should.equal("string",typeof treeStr([]));
        should.equal("string",typeof treeStr(null));
        should.equal("string",typeof treeStr(undefined));
        should.equal("string",typeof treeStr("abd13"));

        done && done.call(this);
    });

});

