var should = require('should');
var check = require('../lib/json-check-circular');

function typeOf(obj){
    return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
}

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


describe("Test './lib/json-check-circular.js':", function() {

    it("check a obj, without error throwing", function(done) {
        should.doesNotThrow(function(){
            check(testJson);
        });

        done && done.call(this);
    });

    it("return 'result.isCircular=false' res when check a unCircular obj", function(done) {

        should.equal(false,check(testJson).isCircular);

        done && done.call(this);
    });

    it("return 'result.isCircular=true' when check a circular obj", function(done) {

        var checkRes = check(circularObj);
        var isCircular = checkRes.isCircular;
        var circularProps = checkRes.circularProps;

        should.equal(true,isCircular);

        var isCheckResultCorrect = true;
        [
            {
                keyPath: 'ROOT.circularRef',
                circularTo: 'ROOT',
                key: 'circularRef',
                value: '[Circular->ROOT]'
            },
            {
                keyPath: 'ROOT.list.0',
                circularTo: 'ROOT',
                key: '0',
                value: '[Circular->ROOT]'
            },
            {
                keyPath: 'ROOT.list.1',
                circularTo: 'ROOT',
                key: '1',
                value: '[Circular->ROOT]'
            },
            {
                keyPath: 'ROOT.a.b',
                circularTo: 'ROOT',
                key: 'b',
                value: '[Circular->ROOT]'
            }
        ].forEach(function(item){
            // check include in circularProps
            var hasInclude = false;
            circularProps.forEach(function(cp){
                if(cp.key === item.key
                    && cp.keyPath === item.keyPath
                      && cp.circularTo === item.circularTo
                        && cp.v === item.v
                ){
                    hasInclude = true;
                }
            });

            if(!hasInclude){
                isCheckResultCorrect = false;
            }
        });

        should.equal(true,isCheckResultCorrect);

        done && done.call(this);
    });

});

