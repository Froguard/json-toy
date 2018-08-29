var path = require('path');
var should = require('should');
var colorful = require('../../lib/cli/colorful');

describe("Test './lib/cli/colorful'", function() {
    
    it("create incorrectly", function(done) {
        should.equal(true, !!colorful.create(1));
        should.equal(true, !!colorful.create(0));

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