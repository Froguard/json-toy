import * as Type from '../../src/lib/type-of';

// test data
let obj = new Object("obj1"),//string instance actually,but 'typeof' is not string
    date = new Date(),
    error = new Error("e1"),
    typeError = new TypeError("te1"),
    syntaxError = new SyntaxError("se1"),
    sy1 = Symbol("sy1"),
    regex1 = /^(a|b|)(c|d)$/gi;

/**
 * You'd better do not init a primitive type variable via 'new Object'
 * is would make somme confused in program!!!
 */

function Person(){}
// @ts-ignore
let p = new Person();


// exposed members
describe("Test './lib/type-of.ts' >> exports method:", function() {

    it("Type.isBoolean", function(done) {
        let calc = Type.isBoolean;
        // is
        expect(calc(true)).toBe(true);
        expect(calc(false)).toBe(true);
        expect(calc(new Boolean(true))).toBe(true);
        expect(calc(new Boolean(false))).toBe(true);
        expect(calc(new Boolean(1))).toBe(true);
        expect(calc(new Boolean(0))).toBe(true);
        // not
        expect(calc(0)).not.toBe(true);
        expect(calc(1)).not.toBe(true);
        expect(calc("")).not.toBe(true);
        expect(calc(undefined)).not.toBe(true);
        expect(calc(null)).not.toBe(true);
        expect(calc({})).not.toBe(true);
        expect(calc([])).not.toBe(true);

        typeof done === 'function' && done();
    });

    it("Type.isString", function(done) {
        let calc = Type.isString;
        // is
        expect(calc("a")).toBe(true);
        expect(calc(new String("a"))).toBe(true);

        typeof done === 'function' && done();
    });

    it("Type.isChar", function(done) {
        let calc = Type.isChar;
        // is
        expect(calc("a")).toBe(true);
        // not
        expect(calc("")).not.toBe(true);
        expect(calc("123")).not.toBe(true);

        typeof done === 'function' && done();
    });

    it("Type.isObject", function(done) {
        let calc = Type.isObject;
        // is
        expect(calc([])).toBe(true);
        expect(calc([1,2,3])).toBe(true);
        expect(calc(p)).toBe(true);
        expect(calc({})).toBe(true);
        expect(calc(error)).toBe(true);
        expect(calc(typeError)).toBe(true);
        expect(calc(syntaxError)).toBe(true);
        expect(calc(obj)).toBe(true);
        expect(calc(regex1)).toBe(true);
        expect(calc(Person)).toBe(true);

        // not: primitive type
        expect(calc(1)).not.toBe(true);
        expect(calc(0)).not.toBe(true);
        expect(calc(false)).not.toBe(true);
        expect(calc(true)).not.toBe(true);
        expect(calc("")).not.toBe(true);
        expect(calc("123")).not.toBe(true);
        expect(calc(sy1)).not.toBe(true);
        expect(calc(null)).not.toBe(true);
        expect(calc(undefined)).not.toBe(true);


        typeof done === 'function' && done();
    });

    it("Type.isObject.isFlat", function(done) {
        // @ts-ignore
        let isFlat = Type.isObject.isFlat;

        // is
        expect(isFlat({})).toBe(true);
        expect(isFlat(null)).toBe(true);
        expect(isFlat(new Object({}))).toBe(true);
        expect(isFlat(new Object(null))).toBe(true);
        expect(isFlat(new Object(undefined))).toBe(true);

        // not
        expect(isFlat(1)).not.toBe(true);
        expect(isFlat(0)).not.toBe(true);
        expect(isFlat(false)).not.toBe(true);
        expect(isFlat(true)).not.toBe(true);
        expect(isFlat("")).not.toBe(true);
        expect(isFlat("123")).not.toBe(true);
        expect(isFlat(sy1)).not.toBe(true);
        expect(isFlat(undefined)).not.toBe(true);
        expect(isFlat(Person)).not.toBe(true);

        typeof done === 'function' && done();
    });

    it("Type.isObject.isEmpty", function(done) {
        // @ts-ignore
        let calc = Type.isObject.isEmpty;
        // is
        expect(calc([])).toBe(true);
        expect(calc({})).toBe(true);

        function A(){}
        A.commonFoo = 1;
        // @ts-ignore
        let a = new A();
        expect(calc(a)).toBe(true);

        // not
        function B(){
          // @ts-ignore
          this.foo = 1;
        }
        // @ts-ignore
        let b = new B("cccc");
        expect(calc(b)).not.toBe(true);// b.foo

        expect(calc(1)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isObject.isEmptyOwn", function(done) {
        // @ts-ignore
        let calc = Type.isObject.isEmptyOwn;
        // is
        expect(calc([])).toBe(true);
        expect(calc({})).toBe(true);
        function A(){}
        // @ts-ignore
        let a = new A();
        expect(calc(a)).toBe(true);

        function A2(){}
        A2.commonFoo = 1;
        // @ts-ignore
        let a2 = new A2();
        expect(calc(a2)).toBe(true);

        // not
        function C(){
          // @ts-ignore
          this.foo = 1;
        }
        // @ts-ignore
        let c = new C("cccc");
        expect(calc(c)).not.toBe(true);

        typeof done === 'function' && done();
    });

    it("Type.isNumber(NaN)", function(done) {
        let calc = Type.isNumber;
        expect(calc(NaN,false)).toBe(true);//第二个参数指代不告警
        expect(calc(NaN,true)).toBe(true);

        typeof done === 'function' && done();
    });

    it("Type.isRealNumber", function(done) {
        let calc = Type.isRealNumber;
        expect(calc(1)).toBe(true);
        expect(calc(new Number(1))).toBe(true);

        expect(calc(NaN)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isNumber.decimal", function(done) {
        // @ts-ignore
        let calc = Type.isNumber.decimal;
        expect(calc(1.23)).toBe(true);
        expect(calc(1)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isNumber.integer", function(done) {
        // @ts-ignore
        let calc = Type.isNumber.integer;
        expect(calc(1)).toBe(true);
        expect(calc(1.1)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isNumber.odd", function(done) {
        // @ts-ignore
        let calc = Type.isNumber.odd;
        expect(calc(1)).toBe(true);
        expect(calc(2)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isNumber.even", function(done) {
        // @ts-ignore
        let calc = Type.isNumber.even;
        expect(calc(2)).toBe(true);
        expect(calc(1)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isArray", function(done) {
        let calc = Type.isArray;
        expect(calc([])).toBe(true);
        expect(calc([1,2])).toBe(true);
        expect(calc("a")).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isArguments", function(done) {
        let calc = Type.isArguments;
        // cant test
        (function(...args: any[]){
            expect(calc(arguments)).toBe(true);
        })(1,2,3);

        typeof done === 'function' && done();
    });

    it("Type.isDate", function(done) {
        let calc = Type.isDate;
        expect(calc(new Date())).toBe(true);
        expect(calc(1)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isError", function(done) {
        let calc = Type.isError;
        expect(calc(new Error())).toBe(true);
        expect(calc(new SyntaxError())).toBe(true);
        expect(calc(new TypeError())).toBe(true);
        expect(calc(new RangeError())).toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isSyntaxError", function(done) {
        let calc = Type.isSyntaxError;
        expect(calc(new SyntaxError())).toBe(true);
        expect(calc(new Error())).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isTypeError", function(done) {
        let calc = Type.isTypeError;
        expect(calc(new TypeError())).toBe(true);
        expect(calc(new Error())).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isRangeError", function(done) {
        let calc = Type.isRangeError;
        expect(calc(new RangeError())).toBe(true);
        expect(calc(new Error())).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isRegExp", function(done) {
        let calc = Type.isRegExp;
        expect(calc(/^[abc]/gi)).toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isSymbol", function(done) {
        let calc = Type.isSymbol;
        expect(calc(Symbol("sb1"))).toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isPrimitive", function(done) {
        let calc = Type.isPrimitive;
        expect(calc("a")).toBe(true);
        expect(calc({})).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isSpreadable", function(done) {
        let calc = Type.isSpreadable;
        // is
        expect(calc({"a":1})).toBe(true);
        expect(calc([1,2,3])).toBe(true);

        function A1(){}
        A1.prop1 = "lol";
        expect(calc(A1)).toBe(true);

        // not
        expect(calc([])).not.toBe(true);
        expect(calc({})).not.toBe(true);

        function A2(){}
        expect(calc(A2)).not.toBe(true);

        expect(calc(1)).not.toBe(true);
        expect(calc(null)).not.toBe(true);
        expect(calc(undefined)).not.toBe(true);
        typeof done === 'function' && done();
    });

    it("Type.isJSON", function(done) {
        let calc = Type.isJSON;
        // is
        expect(calc(undefined)).toBe(true);
        expect(calc(null)).toBe(true);
        expect(calc({})).toBe(true);
        expect(calc({"a":1})).toBe(true);
        expect(calc([])).toBe(true);
        expect(calc([1,2,3])).toBe(true);
        // not
        expect(calc(function(){})).not.toBe(true);// function is not json
        typeof done === 'function' && done();
    });

    it("Type.isNill, isUndefined, isNull, isNaN", function(done) {
        // is
        expect(Type.isUndefined(undefined)).toBe(true);
        expect(Type.isNull(null)).toBe(true);
        expect(Type.isNill(undefined)).toBe(true);
        expect(Type.isNill(null)).toBe(true);
        expect(Type.isNaN(NaN)).toBe(true);
        // not
        expect(Type.isNull(NaN)).not.toBe(true);
        expect(Type.isNull(undefined)).not.toBe(true);
        expect(Type.isNull(0)).not.toBe(true);
        expect(Type.isUndefined(NaN)).not.toBe(true);
        expect(Type.isUndefined(null)).not.toBe(true);
        expect(Type.isUndefined(0)).not.toBe(true);
        expect(Type.isNill(NaN)).not.toBe(true);
        expect(Type.isNill(0)).not.toBe(true);
        expect(Type.isNaN(null)).not.toBe(true);
        expect(Type.isNaN(undefined)).not.toBe(true);
        expect(Type.isNaN(0)).not.toBe(true);
        typeof done === 'function' && done();
    });


});

export {};