import { treeify as treeStr } from '../../src/lib/json-treeify';
// correct
let testJson: any = {
    x: {
        y: [
            0,
            1,
            {
                z: 'helloZ中文中文中文中文中文中文'
            },
            [
                0,
                1,
                2,
                3
            ]
        ],
        z(a: any){}
    }
};

// circularObj 循环自引用
let circularObj: any = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];
circularObj.a = {b: circularObj};


describe('Test \'./lib/json-treeify.ts\':', () => {

    it('convert json to tree-string without throwing error, and return a string', function(done) {
        expect(() => {
            treeStr('');
            // @ts-ignore
            treeStr();
            treeStr(null);
            treeStr(undefined);
        }).not.toThrow();

        expect(() => {
            treeStr(testJson, {space: '\t'});
        }).not.toThrow();

        expect(() => {
            treeStr(testJson, {needValueOut: false, vSpace: -1, space: -1, jsonName: ''});
        }).not.toThrow();

        expect(() => {
            treeStr(testJson, {needValueOut: false, vSpace: 4, space: 9, jsonName: ''});
        }).not.toThrow();

        expect(() => {
            treeStr(testJson, {needValueOut: false, vSpace: NaN, space: 9, jsonName: ''});
        }).not.toThrow();

        // @ts-ignore
        expect(typeof treeStr(testJson, null)).toBe('string');

        expect(
          treeStr(testJson, { msReturnChar: true }).includes('\r')
        ).toBe(true);

        typeof done === 'function' && done();
    });

    it('convert a circularObj to tree-string without throwing error', function(done) {
        expect(() => {
            treeStr(circularObj);
        }).not.toThrow();

        typeof done === 'function' && done();
    });

    it('undefined,null,primitive type return a string', function(done) {
        expect(typeof treeStr(1)).toBe('string');
        expect(typeof treeStr({})).toBe('string');
        expect(typeof treeStr([])).toBe('string');
        expect(typeof treeStr(null)).toBe('string');
        expect(typeof treeStr(undefined)).toBe('string');
        expect(typeof treeStr('abd13')).toBe('string');

        typeof done === 'function' && done();
    });

});

export {};

