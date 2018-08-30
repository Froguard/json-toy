let path = require('path');
let should = require('should');
let colorful = require('../../lib/cli/colorful');
let rewire = require('rewire');

describe("Test './lib/cli/colorful'", function() {

    it("inner function 'genFn','colorify' execute incorrectly", function(done) {
        let colorful = rewire('../../lib/cli/colorful');
        let genFn = colorful.__get__('genFn');
        let colorify = colorful.__get__('colorify');
        let noop = colorful.__get__('noop');

        should.equal(true, !!genFn());
        should.equal(true, !!genFn('black', 'bgWhite', 'normal')(1,2,3));
        should.equal(true, !genFn()());
        should.equal(true, !!genFn()(1));
        should.equal(true, !!genFn()(1,2,3,4));
        should.equal(true, !!genFn()(1,2,3,4,{a: 1}));

        should.equal('string', typeof colorify(''));
        should.equal('string', typeof colorify('', {}));

        should.equal('string', typeof noop(''));

        done && done.call(this);
    });

    it("create incorrectly", function(done) {
        should.equal(true, !!colorful.create(1));
        should.equal(true, !!colorful.create(0));
        should.equal(true, !!colorful.create());

        done && done.call(this);
    });

    it("execute incorrectly", function(done) {
        should.equal(true, !!colorful.error('121323'));
        should.equal(true, !!colorful.success('121323'));
        should.equal(true, !!colorful.fail('121323'));
        should.equal(true, !!colorful.warn('121323'));
        should.equal(true, !!colorful.red('121323'));

        should.equal(true, !!colorful.error(123));
        should.equal(true, !!colorful.success(123));
        should.equal(true, !!colorful.fail(123));
        should.equal(true, !!colorful.warn(123));
        should.equal(true, !!colorful.red(123));


        done && done.call(this);
    });

});