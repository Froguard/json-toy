/**
 * Type check
 *
 * You'd better do not init a primitive type variable via 'new Object'
 * is would make somme confused in program!!!
 */

/*
 * 获取typeString，结果里会带有'['和']'字符
 * @param obj
 * @returns {string}
 * @private
 */
function _typeString(obj){
    return Object.prototype.toString.call(obj);
}

/*
 * 获取Type
 * @param obj
 * @returns {string}
 *   _getType(1);//"number"
 *   _getType([]);//"array"
 *   _getType({});//"object"
 *   let p1 = new Person("petter");//custom type
 *   _getType(p1);//"person"
 */
function _getType(obj){
    if(obj === null || obj === undefined){
        return obj === undefined ? "undefined" : "null";// String(obj)
    }else{
        let typeName = _typeString(obj).slice(8,-1).toLowerCase();
        //将object类型再细化一下,以区分出自定义类型以及细化类型
        let tpOf = typeof obj;// 这里要用typeof关键字而非typeName这个结果,不然error的子类会不准确
        if(typeName!=="arguments" && (tpOf==="object" || tpOf==="function")){
            typeName = (obj.constructor && obj.constructor.name) ? obj.constructor.name.toLowerCase() : typeName;
        }
        return typeName;
    }
}

/*
 * 判断类型函数
 * @param type
 * @returns {Function}
 */
function _isTypeOf(type){
    type = ( (typeof type === "string" || type instanceof String) ? type : "" ).toLowerCase();
    return function(obj){
        return type === _getType(obj);
    }
}

/*
 * 判断类型isXxx(obj)
 * @param obj
 * @returns {Boolean}
 */
let _Type_ = {};
[
    "arguments","array","date",
    "error","syntaxError","typeError","rangeError",
    "regExp","symbol",
    "set","weakSet",
    "map","weakMap"
].forEach(function(t){
    _Type_["is" + t[0].toUpperCase() + t.substr(1)] = _isTypeOf(t);
});
let isArguments = _Type_.isArguments;
let isSymbol = _Type_.isSymbol;
let isSet = _Type_.isSet;
let isWeakSet = _Type_.isWeakSet;
let isMap = _Type_.isMap;
let isWeakMap = _Type_.isWeakMap;
function isArray(obj){
    return _Type_.isArray(obj) || (typeof Array.isArray !=='undefined' && Array.isArray(obj));
}
// date 和 RegExp的判断必须要在 toString函数执行之前
function isDate(obj){
    return obj instanceof Date || _Type_.isDate(obj);
}
function isRegExp(obj){
    return obj instanceof RegExp || _Type_.isRegExp(obj);
}
function isError(obj){
    return _Type_.isError(obj) || obj instanceof Error;
}
function isSyntaxError(obj){
    return _Type_.isSyntaxError(obj) || obj instanceof SyntaxError;
}
function isTypeError(obj){
    return _Type_.isTypeError(obj) || obj instanceof TypeError;
}
function isRangeError(obj){
    return _Type_.isRangeError(obj) || obj instanceof RangeError;
}

// isObject:这里采用原生关键字typeof判定，即：数组，任何自定义类型，都属于Object
/* eg:
   function Person(){};
   let p1 = new Person();
   isObject(p1);//true
   isObject(Person);//false, function
   isObject("12aa");//false, string is primitive type
   isObject([1,2,3]);//true, array is object via 'typeof'
*/
function isObject(obj) {
    return (typeof obj === "object" || obj instanceof Object) && obj !==null;
}
function isFunction(obj) {
    return typeof obj === "function" || obj instanceof Function;
}
function isNull(obj){
    return obj === null;
}
function isUndefined(obj){
    return obj === undefined;
}
function isNill(obj){
    return (obj === null || obj === undefined);
}
// isUndefinedOrNull
// isNullOrUndefined
function isBoolean(obj){
    return obj === true || obj === false || obj instanceof Boolean;
}
function isString(obj) {
    return typeof obj === "string" || obj instanceof String;
}
function isChar(obj){
    return isString(obj) && obj.length === 1;
}
function isNumber(obj,warn) {
    warn = warn===undefined ? true : !!warn;//default true
    if(warn && obj !== obj){// warning when NaN
        console.warn("obj is NaN. Using 'isRealNumber(obj)' instead of 'isNumber(obj)'\nOr using 'isNumber(obj,false)' to stop warning out\n");
    }
    return typeof obj === "number" || obj instanceof Number;
}
function isNaN(obj){
    return obj !== obj;
}
function isRealNumber(obj){
    return !isNaN(obj) && isNumber(obj) ;
}
// 检查是否为简单类型：除开function和object之外的所有类型均为简单类型
function isPrimitive(obj){
    return !isObject(obj) && !isFunction(obj);
}
// 是否还可以再展开: Object,Array,以及某些Function
function isSpreadable(obj){
    if(isArray(obj)){
        return !!obj.length;
    }else if(isObject(obj) || isFunction(obj)){
        for(let j in obj){
            if(obj.hasOwnProperty(j)){
                return true
            }
        }
    }
    return false;
}
// 递归函数判断是否为json
function _isJSON(value, visited) {
    (visited || (visited = [])).push(value);
    return  isPrimitive(value) ||
        (isArray(value) &&  value.every(function(element) {
            return _isJSON(element, visited);
        })) ||
        (isObject.isFlat(value) && Object.keys(value).every(function(key) {
            let $ = Object.getOwnPropertyDescriptor(value, key);
            return  ((!isObject($.value) || !~visited.indexOf($.value))
                    && !('get' in $) && !('set' in $)
                    && _isJSON($.value, visited));
        }));
}
// isJSON
function isJSON(obj){
    return _isJSON(obj);
}
// isObject.isEmpty
isObject.isEmpty = function(obj,ownCheck){
    if(!isObject(obj) && !isArray(obj)){
        return false;
    }
    ownCheck = ownCheck || false;
    for(let k in obj){
        if(ownCheck){
            if(obj.hasOwnProperty(k)){
                return false;
            }
        }else{
            return false;
        }
    }
    return true;
};
// isObject.isEmptyOwn: return true if has none own property
isObject.isEmptyOwn = function(obj){
    return isObject.isEmpty(obj,true);
};
/*
 flat (对象的直接来源 `Object.prototype` or `null`).
 eg:
 isFlat({}) // true
 isFlat(new Type()) // false
 */
isObject.isFlat = function(obj) {
    if(isNull(obj)){
        return true;
    }else if(isObject(obj)){
        return null===Object.getPrototypeOf(obj)
            || (null===Object.getPrototypeOf(Object.getPrototypeOf(obj)));
    }else{
        return false;
    }
};
// decimal 浮点
isNumber.decimal = function(obj){
    return !isNaN(obj) && isNumber(obj) && (obj % 1 !== 0);
};
// integer 整型
isNumber.integer = function(obj){
    return !isNaN(obj) && isNumber(obj) && (obj % 1 === 0);
};
// odd 奇数
isNumber.odd = function(obj){
    return !isNaN(obj) && isNumber(obj) && (obj % 2 !== 0);//这里判断不使用位操作符&，因为会使得一些特殊数如Infinity的结果不对
};
// even 偶数
isNumber.even = function(obj){
    return !isNaN(obj) && isNumber(obj) && (obj % 2 === 0);
};
/*
 ECMAScript当对数值应用位操作符时会发生如下转换过程：
 64位的数值被转换成32位数值，然后执行位操作，最后再将32位的结果转换回64位数值。这样，表面上看起来就好像是在操作32位数值。
 但这个转换过程也导致了一个严重的负效应，即在对特殊的NaN和Infinity值应用位操作时，这两个值都会被当成0来处理。
 如果对非数值进行位操作，会先使用Number()函数将该数值转换成一个数值（自动完成），然后再应用位操作，得到的结果是一个数值。
*/

/*
 * query prototype chain to check instanceof
 * @param value
 * @param Type
 * @returns {boolean}
 *
 * 用法：
 *    余原生的instanceof有区别，原生的instanceof对于简单类型的判定都是false
 *    而本例中会递归去查询原型链
 *    isInstanceOf(NaN,Number);// false
 */
// isInstanceOf
function _instOf(value, type) {
    // 先用原生instanceof判断
    let isInstanceOf = value instanceof type;
    // 对于非undefined和非null的value，需要再用构造器名称判断，以避免原生instanceof的判定
    let isConstructorNameSame,isConstructorSourceSame;
    if (!isInstanceOf && undefined!==value && null!==value) {
        isConstructorNameSame = (value.constructor && value.constructor.name === type.name);
        isConstructorSourceSame = (value.constructor && String(value.constructor) == String(type));
        isInstanceOf = (isConstructorNameSame && isConstructorSourceSame);
        isInstanceOf = isInstanceOf || _instOf(Object.getPrototypeOf(value), type);
    }
    return isInstanceOf;
}

// exports
module.exports = {
    typeStr: _typeString,
    getTypeOf: _getType,
    isTypeOf: _isTypeOf,
    isInstanceOf: _instOf,
    //
    isArguments,
    isSymbol,
    isSet,
    isWeakSet,
    isMap,
    isWeakMap,
    isArray,
    isDate,
    isRegExp,
    isError,
    isSyntaxError,
    isTypeError,
    isRangeError,
    isObject,
    isFunction,
    isNull,
    isUndefined,
    isNill,
    isNullOrUndefined: isNill,
    isUndefinedOrNull: isNill,
    isBoolean,
    isString,
    isChar,
    isNumber,
    isNaN,
    isRealNumber,
    isPrimitive,
    isSpreadable,
    isJSON
};