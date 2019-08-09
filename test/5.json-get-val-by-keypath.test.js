let should = require('should');
let getVal = require('../lib/json-get-val-by-keypath');

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
    },
    '[': {
        ']': 2
    },
    hasDotChar: {
        'jquery.min.js': 'include_dot_char',
        '.': 'just_a_dot_char',
        '&bull;': 'just_a_convert_char_set_1',
        '&amp;': 'just_a_convert_char_set_2',
        '&': 'one_sp_char'
    }

};

describe('Test \'./lib/json-get-val-by-keypath.js\':', () => {

    it('get correct value of existed prop by keyPath', function(done) {
        should.equal(1, getVal(testJson, 'x.y.1'));
        should.equal(1, getVal(testJson, 'x.y.1', false));
        should.equal(1, getVal(testJson, 'x.y.1', true));
        should.equal('helloZ', getVal(testJson, 'x.y.2.z'));
        should.equal(3, getVal(testJson, 'x.y.3.3'));
        should.equal(2, getVal(testJson, '[.]'));

        // special char
        should.equal('include_dot_char', getVal(testJson, 'hasDotChar.jquery&bull;min&bull;js'));
        should.equal('just_a_dot_char', getVal(testJson, 'hasDotChar.&bull;'));
        should.equal('just_a_convert_char_set_1', getVal(testJson, 'hasDotChar.&amp;bull;'));
        should.equal('just_a_convert_char_set_2', getVal(testJson, 'hasDotChar.&amp;amp;'));
        should.equal('one_sp_char', getVal(testJson, 'hasDotChar.&amp;'));

        done && done.call(this);
    });

    it('get undefined if prop corresponding in keypath is not existed in json obj', function(done) {

        should.deepEqual(undefined, getVal(testJson, 'a.b.c.d'));
        should.deepEqual(undefined, getVal(testJson, 'x.y.-1'));
        should.deepEqual(undefined, getVal(testJson, 'x.y.4'));

        done && done.call(this);
    });

    it('throw error during getVal(nill)', function(done) {

        should.throws(() => getVal(null, 'a.b.c.d'));

        done && done.call(this);
    });
});

