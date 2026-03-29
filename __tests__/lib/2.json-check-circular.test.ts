import { checkCircular as check } from '../../src/lib/json-check-circular';

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
let circularObj :any = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];
circularObj.a = {b: circularObj};


describe('Test \'./lib/json-check-circular.ts\':', () => {

    it('check a obj, without error throwing', function(done) {
        expect(() => check(testJson)).not.toThrow();

        typeof done === 'function' && done();
    });

    it('return \'result.isCircular=false\' res when check a unCircular obj', function(done) {

        expect(check(testJson).isCircular).toBe(false);

        typeof done === 'function' && done();
    });

    it('return \'result.isCircular=true\' when check a circular obj', function(done) {

        let checkRes = check(circularObj);
        let isCircular = checkRes.isCircular;
        let circularProps = checkRes.circularProps;

        console.log('WF:\n', circularProps);

        expect(isCircular).toBe(true);

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
            (circularProps as Array<any>).forEach((cp) => {
                if(cp.key === item.key
                    && cp.keyPath === item.keyPath
                      && cp.circularTo === item.circularTo
                        && cp.value === item.value
                ){
                    hasInclude = true;
                }
            });

            if(!hasInclude){
                isCheckResultCorrect = false;
            }
        });

        expect(isCheckResultCorrect).toBe(true);

        typeof done === 'function' && done();
    });

});

export {};

