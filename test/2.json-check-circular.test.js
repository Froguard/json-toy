let should = require('should');
let check = require('../lib/json-check-circular');

function typeOf(obj){
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

// correct-obj
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

// circular-obj
let circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];
circularObj.a = {b: circularObj};


describe('Test \'./lib/json-check-circular.js\':', () => {

    it('check a obj, without error throwing', function(done) {
        should.doesNotThrow(() => check(testJson));

        done && done.call(this);
    });

    it('return \'result.isCircular=false\' res when check a unCircular obj', function(done) {

        should.equal(false, check(testJson).isCircular);

        done && done.call(this);
    });

    it('return \'result.isCircular=true\' when check a circular obj', function(done) {

        let checkRes = check(circularObj);
        let isCircular = checkRes.isCircular;
        let circularProps = checkRes.circularProps;

        should.equal(true, isCircular);

        let isCheckResultCorrect = true;
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
        ].forEach((item) => {
            // check include in circularProps
            let hasInclude = false;
            circularProps.forEach((cp) => {
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

        should.equal(true, isCheckResultCorrect);

        done && done.call(this);
    });

});

