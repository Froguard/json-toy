import path from 'path';
import dir2Json from '../../src/bin/utils/walk-dir';
let libDirExceptJson = {
  'json-check-circular.ts': 'file',
  'json-get-val-by-keypath.ts': 'file',
  'json-treeify.ts': 'file',
  'json-travel.ts': 'file',
  'type-of.ts': 'file',
};

// console.log(dir2Json(path.join(__dirname,"../../lib")));

describe("Test './lib/cli/walk-dir.js'", function () {
  it('check json value form walk dir', function (done) {
    // expect(() => { dir2Json(); }).toThrow();

    expect(() => {
      dir2Json(path.join(__dirname, '../../src/lib'));
    }).not.toThrow();

    expect(
      dir2Json(path.join(__dirname, '../../src/lib'), {
        exclude: {},
        preChars: {},
        extChars: {},
        maxDepth: 5,
      }),
    ).toEqual(libDirExceptJson);

    expect(
      dir2Json(path.join(__dirname, '../../src/lib'), {
        exclude: undefined,
        preChars: undefined,
        extChars: undefined,
        maxDepth: 5,
      }),
    ).toEqual(libDirExceptJson);

    expect(
      dir2Json(path.join(__dirname, '../../src/lib'), {
        maxDepth: 100,
      }),
    ).toEqual(libDirExceptJson);

    typeof done === 'function' && done();
  });

  it('throw error when walk a dir is not existed!', function (done) {
    expect(() => {
      dir2Json(path.join(__dirname, '../../abcdefg'));
    }).toThrow();

    typeof done === 'function' && done();
  });

  it('return string tip when walk a non-directory path!', function (done) {
    // walk a existed file
    expect(dir2Json(path.join(__dirname, './walk-dir.test.ts'))).toBe('not a directory');

    typeof done === 'function' && done();
  });

  it('check json value form ignore directory or file, and no output ignored-dir-props', function (done) {
    expect(
      dir2Json(path.join(__dirname, './test_dir'), {
        exclude: {
          all: /^\..+/g, // 所有 . 开头的文件或文件夹
        },
        maxDepth: 5,
      }),
    ).toEqual({ a_ignore_dir: {} });

    expect(
      dir2Json(path.join(__dirname, './test_dir'), {
        exclude: {
          directory: /a_ignore_dir/g, // 所有 . 开头的文件或文件夹
        },
        maxDepth: 5,
      }),
    ).toEqual({
      '.gitkeep': 'file',
    });
    typeof done === 'function' && done();
  });

  it("check json value form ignore directory, and output ignored-dir-props with flag 'xxx (ignored)'", function (done) {
    expect(
      dir2Json(path.join(__dirname, './test_dir'), {
        exclude: {
          directory: /a_ignore_dir/g, // 所有 . 开头的文件或文件夹
          outExcludeDir: true,
        },
        maxDepth: 5,
      }),
    ).toEqual({
      'a_ignore_dir (ignored)': {},
      '.gitkeep': 'file',
    });

    expect(
      dir2Json(path.join(__dirname, './test_dir'), {
        exclude: {
          file: /^\..*/g, // 所有 . 开头的文件或文件夹
          outExcludeDir: true,
        },
        maxDepth: 5,
      }),
    ).toEqual({
      a_ignore_dir: {},
    });

    typeof done === 'function' && done();
  });

  it('check json value form empty directory', function (done) {
    expect(
      dir2Json(path.join(__dirname, './test_dir/a_ignore_dir'), {
        exclude: {
          all: /^\..+/g, // 所有 . 开头的文件或文件夹
        },
        maxDepth: 5,
      }),
    ).toEqual(null);

    typeof done === 'function' && done();
  });
});

export {};
