let should = require('should');
let travel = require('../lib/json-travel');

function typeOf(obj){
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

// correct
let testJson = {
    x: {
        y: [
            0,
            1,
            {
                z: 'helloZ'
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
let keysFortestJson = [
    'ROOT.x',
    'ROOT.x.y',
    'ROOT.x.y.0',
    'ROOT.x.y.1',
    'ROOT.x.y.2',
    'ROOT.x.y.2.z',
    'ROOT.x.y.3',
    'ROOT.x.y.3.0',
    'ROOT.x.y.3.1',
    'ROOT.x.y.3.2',
    'ROOT.x.y.3.3'
];

// circularObj 循环自引用
let circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];
circularObj.a = {b: circularObj, c: circularObj};


describe('Test \'./lib/json-travel.js\':', () => {

    it('throwing error when travel a primitive type', function(done) {
        should.throws(() => {
            travel(1);
        });
        should.throws(() => {
            travel();
            travel(null);
        });
        done && done.call(this);
    });

    it('travel a correct json without throwing error, and return a array', function(done) {
        should.doesNotThrow(() => {
            travel(testJson);
        });
        should.doesNotThrow(() => {
            travel(testJson, 1);
        });
        should.equal('array', typeOf(travel(testJson)));
        done && done.call(this);
    });

    it('travel a correct json without throwing error, and return correct values', function(done) {
        let res = travel(testJson),
            isEqual = true;
        should.doesNotThrow(() => {
            let i, iLen = keysFortestJson.length;
            for (i = 0; i < iLen; i++) {
                if(keysFortestJson[i] !== res[i]){
                    isEqual = false;
                    break;
                }
            }
        });
        should.equal(true, isEqual);
        done && done.call(this);
    });

    it('travel a circular obj without throwing error', function(done) {
        should.doesNotThrow(() => {
            travel(circularObj);
        });
        done && done.call(this);
    });

    it('travel a circular obj without throwing error. obj is changed from a correct json by incorrect-operate-code(like change value of json prop in callback)', function(done) {
        let testJson2 = {
            x: {
                y: 1,
                z: 2
            }
        };
        should.doesNotThrow(() => {
            travel(testJson2, () => {
                testJson2.x.y = testJson2;//change the json prop value
            });
        });
        done && done.call(this);
    });

    it('travel a circular obj with throwing error on \'unsafe mode\'', function(done) {
        should.throws(() => {
            travel(circularObj, null, null, false);
        });
        done && done.call(this);
    });

});

