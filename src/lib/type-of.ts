/**
 * Type check
 *
 * You'd better do not init a primitive type variable via 'new Object'
 * is would make somme confused in program!!!
 */

type TypeName = 'arguments' | 'array' | 'date' | 'error' | 'syntaxError' | 'typeError' | 'rangeError' | 'regExp' | 'symbol' | 'set' | 'weakSet' | 'map' | 'weakMap' | 'object' | 'function' | 'boolean' | 'string' | 'number' | 'undefined' | 'null';

/*
 * 获取typeString，结果里会带有'['和']'字符
 * @param obj
 * @returns {string}
 * @private
 */
function _typeString(obj: any): string {
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
function _getType(obj: any): string {
    if(obj === null || obj === undefined){
        return obj === undefined ? 'undefined' : 'null';
    }
    let typeName = _typeString(obj).slice(8, -1).toLowerCase();
    //将object类型再细化一下,以区分出自定义类型以及细化类型
    let tpOf = typeof obj;
    if(typeName !== 'arguments' && (tpOf === 'object' || tpOf === 'function')){
        typeName = (obj.constructor && obj.constructor.name) ? obj.constructor.name.toLowerCase() : typeName;
    }
    return typeName;
}

/*
 * 判断类型函数
 * @param type
 * @returns {Function}
 */
function _isTypeOf(type: string): (obj: any) => boolean {
    type = ((typeof type === 'string' || (type as any) instanceof String) ? type : '').toLowerCase();
    return function(obj: any): boolean {
        return type === _getType(obj);
    };
}

interface TypeCheckers {
    [key: string]: (obj: any) => boolean;
}

/*
 * 判断类型isXxx(obj)
 * @param obj
 * @returns {Boolean}
 */
const _Type_: TypeCheckers = {};
[
    'arguments', 'array', 'date',
    'error', 'syntaxError', 'typeError', 'rangeError',
    'regExp', 'symbol',
    'set', 'weakSet',
    'map', 'weakMap'
].forEach((t) => {
    _Type_[`is${t[0].toUpperCase()}${t.slice(1)}`] = _isTypeOf(t);
});

export const isArguments = _Type_.isArguments;
export const isSymbol = _Type_.isSymbol;
export const isSet = _Type_.isSet;
export const isWeakSet = _Type_.isWeakSet;
export const isMap = _Type_.isMap;
export const isWeakMap = _Type_.isWeakMap;

export function isArray(obj: any): obj is Array<any> {
    return _Type_.isArray(obj) || (typeof Array.isArray !== 'undefined' && Array.isArray(obj));
}

export function isDate(obj: any): boolean {
    return obj instanceof Date || _Type_.isDate(obj);
}

export function isRegExp(obj: any): boolean {
    return obj instanceof RegExp || _Type_.isRegExp(obj);
}

export function isError(obj: any): boolean {
    return _Type_.isError(obj) || obj instanceof Error;
}

export function isSyntaxError(obj: any): boolean {
    return _Type_.isSyntaxError(obj) || obj instanceof SyntaxError;
}

export function isTypeError(obj: any): boolean {
    return _Type_.isTypeError(obj) || obj instanceof TypeError;
}

export function isRangeError(obj: any): boolean {
    return _Type_.isRangeError(obj) || obj instanceof RangeError;
}

export function isObject(obj: any): boolean {
    return (typeof obj === 'object' || obj instanceof Object) && obj !== null;
}

export function isFunction(obj: any): boolean {
    return typeof obj === 'function' || obj instanceof Function;
}

export function isNull(obj: any): boolean {
    return obj === null;
}

export function isUndefined(obj: any): boolean {
    return obj === undefined;
}

export function isNill(obj: any): boolean {
    return (obj === null || obj === undefined);
}

export function isBoolean(obj: any): boolean {
    return obj === true || obj === false || obj instanceof Boolean;
}

export function isString(obj: any): obj is string {
    return typeof obj === 'string' || obj instanceof String;
}

export function isChar(obj: any): obj is string {
    return isString(obj) && obj.length === 1;
}

export function isNumber(obj: any, warn: boolean = true): boolean {
    if(warn && obj !== obj) {
        console.warn('obj is NaN. Using \'isRealNumber(obj)\' instead of \'isNumber(obj)\'\nOr using \'isNumber(obj,false)\' to stop warning out\n');
    }
    return typeof obj === 'number' || obj instanceof Number;
}

export function isNaN(obj: any): boolean {
    return obj !== obj;
}

export function isRealNumber(obj: any): boolean {
    return !isNaN(obj) && isNumber(obj);
}

export function isPrimitive(obj: any): boolean {
    return !isObject(obj) && !isFunction(obj);
}

export function isSpreadable(obj: any): boolean {
    if(isArray(obj)){
        return !!obj.length;
    } else if(isObject(obj) || isFunction(obj)){
        for(let j in obj){
            if(obj.hasOwnProperty(j)){
                return true;
            }
        }
    }
    return false;
}

function _isJSON(value: any, visited: any[] = []): boolean {
    visited.push(value);
    return isPrimitive(value) ||
        (isArray(value) && value.every(element => _isJSON(element, visited))) ||
        ((isObject as any).isFlat(value) && Object.keys(value).every((key) => {
            let $ = Object.getOwnPropertyDescriptor(value, key);
            return $ && ((!isObject($.value) || !visited.includes($.value))
                    && !('get' in $) && !('set' in $)
                    && _isJSON($.value, visited));
        }));
}

export function isJSON(obj: any): boolean {
    return _isJSON(obj);
}

export interface ObjectExtensions {
    isEmpty: (obj: any, ownCheck?: boolean) => boolean;
    isEmptyOwn: (obj: any) => boolean;
    isFlat: (obj: any) => boolean;
}

export interface NumberExtensions {
    decimal: (obj: any) => boolean;
    integer: (obj: any) => boolean;
    odd: (obj: any) => boolean;
    even: (obj: any) => boolean;
}

(isObject as any as ObjectExtensions).isEmpty = function(obj: any, ownCheck?: boolean): boolean {
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

(isObject as any as ObjectExtensions).isEmptyOwn = function(obj: any): boolean {
    return (isObject as any as ObjectExtensions).isEmpty(obj, true);
};

(isObject as any as ObjectExtensions).isFlat = function(obj: any): boolean {
    if(isNull(obj)){
        return true;
    }else if(isObject(obj)){
        return null === Object.getPrototypeOf(obj)
            || (null === Object.getPrototypeOf(Object.getPrototypeOf(obj)));
    }
    return false;
};

(isNumber as any as NumberExtensions).decimal = function(obj: any): boolean {
    return !isNaN(obj) && isNumber(obj) && (obj % 1 !== 0);
};

(isNumber as any as NumberExtensions).integer = function(obj: any): boolean {
    return !isNaN(obj) && isNumber(obj) && (obj % 1 === 0);
};

(isNumber as any as NumberExtensions).odd = function(obj: any): boolean {
    return !isNaN(obj) && isNumber(obj) && (obj % 2 !== 0);
};

(isNumber as any as NumberExtensions).even = function(obj: any): boolean {
    return !isNaN(obj) && isNumber(obj) && (obj % 2 === 0);
};

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
export function getTypeOf(obj: any): string {
    return _getType(obj);
} 