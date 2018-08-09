var fs = require('fs');
var path = require('path');
var should = require('should');
var dir2Json = require('../../lib/cli/walk-dir');
var libDirExceptJson = {
    'cli': {
        'colorful.js': 'file',
        'walk-dir.js': 'file'
    },
    'json-check-circular.js': 'file',
    'json-get-val-by-keypath.js': 'file',
    'json-toTreeString.js': 'file',
    'json-travel.js': 'file',
    'typeOf.js': 'file'
};

// console.log(dir2Json(path.join(__dirname,"../../lib")));

describe("Test './lib/cli/walk-dir.js'", function() {
    
    it("check json value form walk dir", function(done) {

        should.deepEqual(libDirExceptJson, dir2Json(path.join(__dirname,"../../lib"),{
            exclude: {},
            preChars: {},
            extChars: {}
        }));

        should.deepEqual(libDirExceptJson, dir2Json(path.join(__dirname,"../../lib"),{
            exclude: null,
            preChars: null,
            extChars: undefined
        }));

        done && done.call(this);
    });

    it("throw error when walk a dir is not existed!", function(done) {

        should.throws(function(){
            dir2Json(path.join(__dirname,"../../abcdefg"))
        });

        done && done.call(this);
    });

    it("return string tip when walk a non-directory path!", function(done) {

        should.equal("not a directory",dir2Json(path.join(__dirname,"walk-dir.test.js")));

        done && done.call(this);
    });
});