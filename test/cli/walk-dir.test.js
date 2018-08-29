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
            extChars: {},
            maxDepth: 5
        }));

        should.deepEqual(libDirExceptJson, dir2Json(path.join(__dirname,"../../lib"),{
            exclude: null,
            preChars: null,
            extChars: undefined,
            maxDepth: 5
        }));

        should.deepEqual(libDirExceptJson, dir2Json(path.join(__dirname,"../../lib"),{
            maxDepth: 100
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

    it("check json value form ignore directory or file, and no output ignored-dir-props", function(done) {

        should.deepEqual({a_ignore_dir: {}}, dir2Json(path.join(__dirname,"./test_dir"),{
            exclude: {
                all: /^\..+/g // 所有 . 开头的文件或文件夹
            },
            maxDepth: 5
        }));

        should.deepEqual(
            {
                ".gitkeep": "file"
            }, dir2Json(path.join(__dirname,"./test_dir"),{
                exclude: {
                    directory: /a_ignore_dir/g // 所有 . 开头的文件或文件夹
                },
                maxDepth: 5
            })
        );
        done && done.call(this);
    });

    it("check json value form ignore directory, and output ignored-dir-props with flag 'xxx (ignored)'", function(done) {

        should.deepEqual(
            {
                "a_ignore_dir (ignored)": {},
                ".gitkeep": "file"
            }, dir2Json(path.join(__dirname,"./test_dir"),{
                exclude: {
                    directory: /a_ignore_dir/g, // 所有 . 开头的文件或文件夹
                    outExcludeDir: true
                },
                maxDepth: 5
            })
        );

        should.deepEqual(
            {
                "a_ignore_dir": {}
            }, dir2Json(path.join(__dirname,"./test_dir"),{
                exclude: {
                    file: /^\..*/g, // 所有 . 开头的文件或文件夹
                    outExcludeDir: true
                },
                maxDepth: 5
            })
        );

        done && done.call(this);
    });

    it("check json value form empty directory", function(done) {

        should.deepEqual(null, dir2Json(path.join(__dirname,"./test_dir/a_ignore_dir"),{
            exclude: {
                all: /^\..+/g // 所有 . 开头的文件或文件夹
            },
            maxDepth: 5
        }));

        done && done.call(this);
    });
});