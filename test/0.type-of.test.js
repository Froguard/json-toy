let rewire = require('rewire'),
    should = require('should');

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
let p = new Person();


// test target
// use rewire instead of require for testing inner private members(functions & var)
let Type = rewire('../lib/type-of.js');


// private method: unexposed members
describe("Test './lib/type-of.js' >> private method:", function() {


    it("_instOf", function(done) {
        let _instOf = Type.__get__('_instOf');

        // primitive type:
        // number
        should.equal(true, _instOf(0,Number));
        should.equal(true, _instOf(1,Number));
        // string
        should.equal(true, _instOf("",String));
        should.equal(true, _instOf("123",String));
        should.equal(true, _instOf(obj,String));
        // boolean
        should.equal(true, _instOf(false,Boolean));
        should.equal(true, _instOf(true,Boolean));
        // symbol
        should.equal(true, _instOf(sy1,Symbol));

        // array
        should.equal(true, _instOf([],Array));
        should.equal(true, _instOf([1,2,3],Array));
        // date
        should.equal(true, _instOf(date,Date));
        // error
        should.equal(true, _instOf(error,Error));
        should.equal(true, _instOf(typeError,Error));
        should.equal(true, _instOf(syntaxError,Error));
        // regex
        should.equal(true, _instOf(regex1,RegExp));


        // object
        // all type is object except null & undefined
        should.equal(true, _instOf(1,Object));
        should.equal(true, _instOf(0,Object));
        should.equal(true, _instOf("",Object));
        should.equal(true, _instOf("123",Object));
        should.equal(true, _instOf(false,Object));
        should.equal(true, _instOf(true,Object));
        should.equal(true, _instOf([],Object));
        should.equal(true, _instOf([1,2,3],Object));
        should.equal(true, _instOf(sy1,Object));
        should.equal(true, _instOf(date,Object));
        should.equal(true, _instOf(error,Object));
        should.equal(true, _instOf(typeError,Object));
        should.equal(true, _instOf(syntaxError,Object));
        should.equal(true, _instOf(regex1,Object));
        should.equal(true, _instOf({},Object));
        should.equal(true, _instOf(obj,Object));
        // custom type
        should.equal(true, _instOf(p,Person));
        should.equal(true, _instOf(p,Object));
        should.equal(true, _instOf(new TypeError("te1"),Error));

        // not instanceof
        // null
        should.notEqual(true, _instOf(null,Number));
        should.notEqual(true, _instOf(null,String));
        should.notEqual(true, _instOf(null,Boolean));
        should.notEqual(true, _instOf(null,Array));
        should.notEqual(true, _instOf(null,Date));
        should.notEqual(true, _instOf(null,Object));
        // undefined
        should.notEqual(true, _instOf(undefined,Number));
        should.notEqual(true, _instOf(undefined,String));
        should.notEqual(true, _instOf(undefined,Boolean));
        should.notEqual(true, _instOf(undefined,Array));
        should.notEqual(true, _instOf(undefined,Date));
        should.notEqual(true, _instOf(undefined,Object));

        // compare each other
        should.notEqual(true, _instOf(1,Boolean));
        should.notEqual(true, _instOf(0,Boolean));
        should.notEqual(true, _instOf("",Boolean));
        should.notEqual(true, _instOf([],Boolean));
        should.notEqual(true, _instOf(true,Number));
        should.notEqual(true, _instOf(false,Number));
        should.notEqual(true, _instOf(typeError,Date));

        done && done.call(this);
    });

    it("_getType", function(done) {
        let _getType = Type.__get__('_getType');
        // all result is lower case
        should.equal("undefined", _getType(undefined));
        should.equal("null", _getType(null));
        should.equal("number", _getType(1));
        should.equal("number", _getType(0));
        should.equal("boolean", _getType(true));
        should.equal("boolean", _getType(false));
        should.equal("string", _getType(""));
        should.equal("string", _getType("123"));
        should.equal("array", _getType([]));
        should.equal("object", _getType({}));
        should.equal("string", _getType(obj));
        should.equal("error", _getType(error));
        should.equal("typeerror", _getType(typeError));
        should.equal("syntaxerror", _getType(syntaxError));
        should.equal("person", _getType(p));
        should.equal("function", _getType(Person));


        done && done.call(this);
    });

    it("_isTypeOf", function(done) {
        // ignore upper or lower case
        let _isTypeOf = Type.__get__('_isTypeOf');
        should.equal(true, _isTypeOf("number")(1));
        should.equal(true, _isTypeOf("Number")(0));
        should.equal(true, _isTypeOf("Boolean")(true));
        should.equal(true, _isTypeOf("boolean")(false));
        should.equal(true, _isTypeOf("String")(""));
        should.equal(true, _isTypeOf("string")("123"));
        should.equal(true, _isTypeOf("string")(obj));
        should.equal(true, _isTypeOf("Array")([]));
        should.equal(true, _isTypeOf("object")({}));
        should.equal(true, _isTypeOf("error")(error));
        should.equal(true, _isTypeOf("typeError")(typeError));
        should.equal(true, _isTypeOf("syntaxError")(syntaxError));
        should.equal(true, _isTypeOf("pErSoN")(p));
        should.equal(true, _isTypeOf("Person")(p));
        should.equal(true, _isTypeOf("function")(Person));
        should.equal(true, _isTypeOf("regexp")(regex1));

        should.notEqual(true, _isTypeOf("")(regex1));
        should.notEqual(true, _isTypeOf(1)(regex1));

        done && done.call(this);
    });

});

// exposed members
describe("Test './lib/type-of.js' >> exports method:", function() {

    it("Type.isBoolean", function(done) {
        let calc = Type.isBoolean;
        // is
        should.equal(true, calc(true));
        should.equal(true, calc(false));
        should.equal(true, calc(new Boolean(true)));
        should.equal(true, calc(new Boolean(false)));
        should.equal(true, calc(new Boolean(1)));
        should.equal(true, calc(new Boolean(0)));
        // not
        should.notEqual(true, calc(0));
        should.notEqual(true, calc(1));
        should.notEqual(true, calc(""));
        should.notEqual(true, calc(undefined));
        should.notEqual(true, calc(null));
        should.notEqual(true, calc({}));
        should.notEqual(true, calc([]));

        done && done.call(this);
    });

    it("Type.isString", function(done) {
        let calc = Type.isString;
        // is
        should.equal(true, calc("a"));
        should.equal(true, calc(new String("a")));

        done && done.call(this);
    });

    it("Type.isChar", function(done) {
        let calc = Type.isChar;
        // is
        should.equal(true, calc("a"));
        // not
        should.notEqual(true, calc(""));
        should.notEqual(true, calc("123"));

        done && done.call(this);
    });

    it("Type.isObject", function(done) {
        let calc = Type.isObject;
        // is
        should.equal(true, calc([]));
        should.equal(true, calc([1,2,3]));
        should.equal(true, calc(p));
        should.equal(true, calc({}));
        should.equal(true, calc(error));
        should.equal(true, calc(typeError));
        should.equal(true, calc(syntaxError));
        should.equal(true, calc(obj));
        should.equal(true, calc(regex1));
        should.equal(true, calc(Person));
        
        // not: primitive type
        should.notEqual(true, calc(1));
        should.notEqual(true, calc(0));
        should.notEqual(true, calc(false));
        should.notEqual(true, calc(true));
        should.notEqual(true, calc(""));
        should.notEqual(true, calc("123"));
        should.notEqual(true, calc(sy1));
        should.notEqual(true, calc(null));
        should.notEqual(true, calc(undefined));


        done && done.call(this);
    });

    it("Type.isObject.isFlat", function(done) {
        let isFlat = Type.isObject.isFlat;

        // is
        should.equal(true, isFlat({}));
        should.equal(true, isFlat(null));
        should.equal(true, isFlat(new Object({})));
        should.equal(true, isFlat(new Object(null)));
        should.equal(true, isFlat(new Object(undefined)));

        // not
        should.notEqual(true, isFlat(1));
        should.notEqual(true, isFlat(0));
        should.notEqual(true, isFlat(false));
        should.notEqual(true, isFlat(true));
        should.notEqual(true, isFlat(""));
        should.notEqual(true, isFlat("123"));
        should.notEqual(true, isFlat(sy1));
        should.notEqual(true, isFlat(undefined));
        should.notEqual(true, isFlat(Person));

        done && done.call(this);
    });

    it("Type.isObject.isEmpty", function(done) {
        let calc = Type.isObject.isEmpty;
        // is
        should.equal(true, calc([]));
        should.equal(true, calc({}));

        function A(){}
        A.commonFoo = 1;
        let a = new A();
        should.equal(true, calc(a));

        // not
        function B(){this.foo = 1;}
        let b = new B("cccc");
        should.notEqual(true, calc(b));// b.foo

        should.notEqual(true, calc(1));
        done && done.call(this);
    });

    it("Type.isObject.isEmptyOwn", function(done) {
        let calc = Type.isObject.isEmptyOwn;
        // is
        should.equal(true, calc([]));
        should.equal(true, calc({}));
        function A(){}
        let a = new A();
        should.equal(true, calc(a));

        function A2(){}
        A2.commonFoo = 1;
        let a2 = new A2();
        should.equal(true, calc(a2));

        // not
        function C(){this.foo = 1;}
        let c = new C("cccc");
        should.notEqual(true, calc(c));

        done && done.call(this);
    });

    it("Type.isNumber(NaN)", function(done) {
        let calc = Type.isNumber;
        should.equal(true, calc(NaN,false));//第二个参数指代不告警
        should.equal(true, calc(NaN,true));

        done && done.call(this);
    });

    it("Type.isRealNumber", function(done) {
        let calc = Type.isRealNumber;
        should.equal(true, calc(1));
        should.equal(true, calc(new Number(1)));

        should.notEqual(true, calc(NaN));
        done && done.call(this);
    });

    it("Type.isNumber.decimal", function(done) {
        let calc = Type.isNumber.decimal;
        should.equal(true, calc(1.23));
        should.notEqual(true, calc(1));
        done && done.call(this);
    });

    it("Type.isNumber.integer", function(done) {
        let calc = Type.isNumber.integer;
        should.equal(true, calc(1));
        should.notEqual(true, calc(1.1));
        done && done.call(this);
    });

    it("Type.isNumber.odd", function(done) {
        let calc = Type.isNumber.odd;
        should.equal(true, calc(1));
        should.notEqual(true, calc(2));
        done && done.call(this);
    });

    it("Type.isNumber.even", function(done) {
        let calc = Type.isNumber.even;
        should.equal(true, calc(2));
        should.notEqual(true, calc(1));
        done && done.call(this);
    });

    it("Type.isArray", function(done) {
        let calc = Type.isArray;
        should.equal(true, calc([]));
        should.equal(true, calc([1,2]));
        should.notEqual(true, calc("a"));
        done && done.call(this);
    });

    it("Type.isArguments", function(done) {
        let calc = Type.isArguments;
        // cant test
        (function(){
            should.equal(true, calc(arguments));
        })(1,2,3);

        done && done.call(this);
    });

    it("Type.isDate", function(done) {
        let calc = Type.isDate;
        should.equal(true, calc(new Date()));
        should.notEqual(true, calc(1));
        done && done.call(this);
    });

    it("Type.isError", function(done) {
        let calc = Type.isError;
        should.equal(true, calc(new Error()));
        should.equal(true, calc(new SyntaxError()));
        should.equal(true, calc(new TypeError()));
        should.equal(true, calc(new RangeError()));
        done && done.call(this);
    });

    it("Type.isSyntaxError", function(done) {
        let calc = Type.isSyntaxError;
        should.equal(true, calc(new SyntaxError()));
        should.notEqual(true, calc(new Error()));
        done && done.call(this);
    });

    it("Type.isTypeError", function(done) {
        let calc = Type.isTypeError;
        should.equal(true, calc(new TypeError()));
        should.notEqual(true, calc(new Error()));
        done && done.call(this);
    });

    it("Type.isRangeError", function(done) {
        let calc = Type.isRangeError;
        should.equal(true, calc(new RangeError()));
        should.notEqual(true, calc(new Error()));
        done && done.call(this);
    });

    it("Type.isRegExp", function(done) {
        let calc = Type.isRegExp;
        should.equal(true, calc(/^[abc]/gi));
        done && done.call(this);
    });

    it("Type.isSymbol", function(done) {
        let calc = Type.isSymbol;
        should.equal(true, calc(Symbol("sb1")));
        done && done.call(this);
    });

    it("Type.isPrimitive", function(done) {
        let calc = Type.isPrimitive;
        should.equal(true, calc("a"));
        should.notEqual(true, calc({}));
        done && done.call(this);
    });

    it("Type.isSpreadable", function(done) {
        let calc = Type.isSpreadable;
        // is
        should.equal(true, calc({"a":1}));
        should.equal(true, calc([1,2,3]));

        function A1(){}
        A1.prop1 = "lol";
        should.equal(true, calc(A1));

        // not
        should.notEqual(true, calc([]));
        should.notEqual(true, calc({}));

        function A2(){}
        should.notEqual(true, calc(A2));

        should.notEqual(true, calc(1));
        should.notEqual(true, calc(null));
        should.notEqual(true, calc(undefined));
        done && done.call(this);
    });

    it("Type.isJSON", function(done) {
        let calc = Type.isJSON;
        // is
        should.equal(true, calc(undefined));
        should.equal(true, calc(null));
        should.equal(true, calc({}));
        should.equal(true, calc({"a":1}));
        should.equal(true, calc([]));
        should.equal(true, calc([1,2,3]));
        // not
        should.notEqual(true, calc(function(){}));// function is not json
        done && done.call(this);
    });

    it("Type.isNill, isUndefined, isNull, isNaN", function(done) {
        // is
        should.equal(true, Type.isUndefined(undefined));
        should.equal(true, Type.isNull(null));
        should.equal(true, Type.isNill(undefined));
        should.equal(true, Type.isNill(null));
        should.equal(true, Type.isNaN(NaN));
        // not
        should.notEqual(true, Type.isNull(NaN));
        should.notEqual(true, Type.isNull(undefined));
        should.notEqual(true, Type.isNull(0));
        should.notEqual(true, Type.isUndefined(NaN));
        should.notEqual(true, Type.isUndefined(null));
        should.notEqual(true, Type.isUndefined(0));
        should.notEqual(true, Type.isNill(NaN));
        should.notEqual(true, Type.isNill(0));
        should.notEqual(true, Type.isNaN(null));
        should.notEqual(true, Type.isNaN(undefined));
        should.notEqual(true, Type.isNaN(0));
        done && done.call(this);
    });


});