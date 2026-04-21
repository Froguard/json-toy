import { travelJson as travel } from '../../src/lib/json-travel';

function typeOf(obj: any) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

// correct
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
  'ROOT.x.y.3.3',
];

// circularObj 循环自引用
let circularObj: any = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];
circularObj.a = { b: circularObj, c: circularObj };

describe("Test './lib/json-travel.ts':", () => {
  it('throwing error when travel a primitive type', function (done) {
    expect(() => {
      travel(1);
    }).toThrow();
    expect(() => {
      // @ts-ignore
      travel();
      travel(null);
    }).toThrow();
    typeof done === 'function' && done();
  });

  it('travel a correct json without throwing error, and return a array', function (done) {
    expect(() => {
      travel(testJson);
    }).not.toThrow();
    expect(() => {
      // @ts-ignore
      travel(testJson, 1);
    }).not.toThrow();
    expect(typeOf(travel(testJson))).toBe('array');
    typeof done === 'function' && done();
  });

  it('travel a correct json without throwing error, and return correct values', function (done) {
    let res = travel(testJson),
      isEqual = true;
    expect(() => {
      let i,
        iLen = keysFortestJson.length;
      for (i = 0; i < iLen; i++) {
        if (keysFortestJson[i] !== res[i]) {
          isEqual = false;
          break;
        }
      }
    }).not.toThrow();
    expect(isEqual).toBe(true);
    typeof done === 'function' && done();
  });

  it('travel a circular obj without throwing error', function (done) {
    expect(() => {
      travel(circularObj);
    }).not.toThrow();
    typeof done === 'function' && done();
  });

  it('travel a circular obj without throwing error. obj is changed from a correct json by incorrect-operate-code(like change value of json prop in callback)', function (done) {
    let testJson2 = {
      x: {
        y: 1,
        z: 2,
      },
    };
    expect(() => {
      travel(testJson2, () => {
        // @ts-ignore
        testJson2.x.y = testJson2; // change the json prop value
      });
    }).not.toThrow();
    typeof done === 'function' && done();
  });

  it("travel a circular obj with throwing error on 'unsafe mode'", function (done) {
    expect(() => {
      // @ts-ignore
      travel(circularObj, null, null, false);
    }).toThrow();
    typeof done === 'function' && done();
  });
});

export {};
