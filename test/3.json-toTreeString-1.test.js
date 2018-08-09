var should = require('should');
var treeStr = require('../lib/json-toTreeString');
// correct
var testJson = {
    "x":{
        "y":[
            0,
            1,
            {
                "z": "helloZ"
            },
            [
                0,
                1,
                2,
                3
            ]
        ]
    }
};

// circularObj 循环自引用
var circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [ circularObj, circularObj ];
circularObj.a = {b:circularObj};


describe("Test './lib/json-toTreeString.js':", function() {

    it("convert json to tree-string without throwing error, and return a string", function(done) {
        should.doesNotThrow(function(){
            treeStr(testJson);
        });

        should.equal("string",typeof treeStr(testJson));
        
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

