import { getValByKeyPath as getVal } from '../../src/lib/json-get-val-by-keypath';

let testJson = {
  x: {
    y: [
      0,
      1,
      {
        z: 'helloZ',
      },
      [0, 1, 2, 3],
    ],
  },
  '[': {
    ']': 2,
  },
  hasDotChar: {
    'jquery.min.js': 'include_dot_char',
    '.': 'just_a_dot_char',
    '&bull;': 'just_a_convert_char_set_1',
    '&amp;': 'just_a_convert_char_set_2',
    '&': 'one_sp_char',
  },
};

describe("Test './lib/json-get-val-by-keypath.ts':", () => {
  it('get correct value of existed prop by keyPath', function (done) {
    expect(getVal(testJson, 'x.y.1')).toBe(1);
    expect(getVal(testJson, 'x.y.1', false)).toBe(1);
    expect(getVal(testJson, 'x.y.1', true)).toBe(1);
    expect(getVal(testJson, 'x.y.2.z')).toBe('helloZ');
    expect(getVal(testJson, 'x.y.3.3')).toBe(3);
    expect(getVal(testJson, '[.]')).toBe(2);

    // special char
    expect(getVal(testJson, 'hasDotChar.jquery&bull;min&bull;js')).toBe('include_dot_char');
    expect(getVal(testJson, 'hasDotChar.&bull;')).toBe('just_a_dot_char');
    expect(getVal(testJson, 'hasDotChar.&amp;bull;')).toBe('just_a_convert_char_set_1');
    expect(getVal(testJson, 'hasDotChar.&amp;amp;')).toBe('just_a_convert_char_set_2');
    expect(getVal(testJson, 'hasDotChar.&amp;')).toBe('one_sp_char');

    typeof done === 'function' && done();
  });

  it('get undefined if prop corresponding in keypath is not existed in json obj', function (done) {
    expect(getVal(testJson, 'a.b.c.d')).toBeUndefined();
    expect(getVal(testJson, 'x.y.-1')).toBeUndefined();
    expect(getVal(testJson, 'x.y.4')).toBeUndefined();

    typeof done === 'function' && done();
  });

  it('throw error during getVal(nill)', function (done) {
    expect(() => getVal(null, 'a.b.c.d')).toThrow();

    typeof done === 'function' && done();
  });
});

export {};
