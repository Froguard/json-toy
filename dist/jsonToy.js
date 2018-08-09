(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jsonToy"] = factory();
	else
		root["jsonToy"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var travelJson = __webpack_require__(1),
	    checkCircular = __webpack_require__(3),
	    getValByKeyPath = __webpack_require__(4),
	    treeString = __webpack_require__(5);

	// exports
	module.exports = {
	    /**
	     * get value of property in json obj
	     * eg: getValByKey({a:{b:{c:1}}}, "a.b.c") = 1
	     * @param json
	     * @param keyPath
	     * @param ownKeyCheck
	     * @returns {Array|*}
	     */
	    getValByKeyPath: getValByKeyPath, // 通过keyPath获取json的属性值

	    /**
	     * Recursive traversal of json obj
	     * @param {Object}   json
	     * @param {Function} cb callback(key,val,curKeyPath,typeStr,isComplexObj,curDepth,isCircular) and context is parent obj
	     * @param {string}   rootAlias
	     * @param {Boolean}  safeMode   default is true
	     * @returns {Array}  keysArr
	     */
	    travelJson: travelJson,

	    /**
	     * convert a json obj to tree-like string
	     * @param {Object} json
	     * @param  {Object} options
	     *         {String} options.rootName
	     *    {char|Number} options.space
	     *         {Number} options.vSpace
	     *        {Boolean} options.valueOut
	     * @returns {string|*} a tree-like string
	     */
	    treeString: treeString,

	    /**
	     * check circular obj
	     * @param obj
	     * @returns {Object} {{isCircular: boolean, circularProps: Array}}
	     */
	    checkCircular: checkCircular
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Type = __webpack_require__(2);
	/**
	 * 递归遍历一个json
	 * @param {Object} json
	 * @param {Function} cb callback(key,val,curKeyPath,typeStr,isComplexObj,curDepth,isCircular) and context is parent obj
	 * @param {string} rootAlias
	 * @param {Boolean} safeMode default is true
	 * @returns {Array} keysArr
	 */
	function travelJson(json, cb, rootAlias, safeMode) {
	    if (!Type.isObject(json)) {
	        throw new TypeError("The first param should be an Object instance!");
	    }
	    // 安全模式
	    safeMode = safeMode === undefined ? true : !!safeMode;
	    var safeStack = []; //记录safe检查时候的对象
	    var safeKeys = []; //记录safe检查时候的key值
	    // res
	    var keysArr = [];
	    var needCb = Type.isFunction(cb);
	    rootAlias = (Type.isString(rootAlias) ? rootAlias : "") || "ROOT";
	    // loop
	    function travel(obj, curKeyPath, depth, cb) {
	        if (obj !== null && obj !== undefined) {
	            // safeMode
	            if (safeMode) {
	                var objIndex = safeStack.indexOf(obj);
	                if (~objIndex) {
	                    // ~-1 == 0
	                    safeStack.splice(objIndex + 1); // pop
	                    safeKeys.splice(objIndex + 1); // pop
	                } else {
	                    safeStack.push(obj); // push
	                    safeKeys.push(curKeyPath);
	                }
	            }
	            // loop
	            for (var k in obj) {
	                if (obj.hasOwnProperty(k)) {
	                    //这里即使curKeyPath为空字符串""也请加上".",这样做是为了统一的循环次数，不管rootAlias是否为空字符串""
	                    var newKeyPath = curKeyPath + "." + k;
	                    keysArr.push(newKeyPath + ""); //push a new string
	                    // 记录下层级
	                    var curDepth = depth + 1;
	                    // 值
	                    var v = obj[k];
	                    var isCircular = false;
	                    // safeMode
	                    if (safeMode) {
	                        var kIndex = safeStack.indexOf(v);
	                        if (~kIndex) {
	                            // Circular
	                            isCircular = true;
	                            v = "[Circular->" + safeKeys[kIndex] + "]";
	                        } else {
	                            isCircular = false;
	                            v = obj[k];
	                        }
	                    }
	                    // 是否可以再展开，这里，函数被视为不可再展开
	                    var spreadable = Type.isSpreadable(v) && !Type.isFunction(v);
	                    // do sth in callback...
	                    needCb && cb.call(obj, k, v, newKeyPath + "", Type.getTypeOf(v), spreadable, curDepth, isCircular);
	                    // then travel in deep
	                    if (spreadable) {
	                        travel(v, newKeyPath, curDepth, cb);
	                    }
	                }
	            }
	        }
	    }
	    // do on catch mode
	    try {
	        travel(json, rootAlias || "", 1, cb); // 栈溢出，递归次数导致内存超限
	    } catch (eTravel) {
	        try {
	            JSON.stringify(json);
	        } catch (eStringify) {
	            throw eStringify;
	        }
	        throw eTravel;
	    }
	    return keysArr;
	}

	module.exports = travelJson;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Type check
	 *
	 * You'd better do not init a primitive type variable via 'new Object'
	 * is would make somme confused in program!!!
	 */
	var Type = {};

	/*
	 * 获取typeString，结果里会带有'['和']'字符
	 * @param obj
	 * @returns {string}
	 * @private
	 */
	function _typeString(obj) {
	    return Object.prototype.toString.call(obj);
	}
	Type.typeStr = _typeString;

	/*
	 * 获取Type
	 * @param obj
	 * @returns {string}
	 *   _getType(1);//"number"
	 *   _getType([]);//"array"
	 *   _getType({});//"object"
	 *   var p1 = new Person("petter");//custom type
	 *   _getType(p1);//"person"
	 */
	function _getType(obj) {
	    if (obj === null || obj === undefined) {
	        return obj === undefined ? "undefined" : "null"; // String(obj)
	    } else {
	        var typeName = _typeString(obj).slice(8, -1).toLowerCase();
	        //将object类型再细化一下,以区分出自定义类型以及细化类型
	        var tpOf = typeof obj; // 这里要用typeof关键字而非typeName这个结果,不然error的子类会不准确
	        if (typeName !== "arguments" && (tpOf === "object" || tpOf === "function")) {
	            typeName = obj.constructor && obj.constructor.name ? obj.constructor.name.toLowerCase() : typeName;
	        }
	        return typeName;
	    }
	}
	Type.getTypeOf = _getType;

	/*
	 * 判断类型函数
	 * @param type
	 * @returns {Function}
	 */
	function _isTypeOf(type) {
	    type = (typeof type === "string" || type instanceof String ? type : "").toLowerCase();
	    return function (obj) {
	        return type === _getType(obj);
	    };
	}
	Type.isTypeOf = _isTypeOf;

	/*
	 * 判断类型isXxx(obj)
	 * @param obj
	 * @returns {Boolean}
	 */
	var _Type_ = {};
	["arguments", "array", "date", "error", "syntaxError", "typeError", "regExp", "symbol", "set", "weakSet", "map", "weakMap"].forEach(function (t) {
	    _Type_["is" + t[0].toUpperCase() + t.substr(1)] = _isTypeOf(t);
	});
	Type.isArguments = _Type_.isArguments;
	Type.isSymbol = _Type_.isSymbol;
	Type.isSet = _Type_.isSet;
	Type.isWeakSet = _Type_.isWeakSet;
	Type.isMap = _Type_.isMap;
	Type.isWeakMap = _Type_.isWeakMap;
	Type.isArray = function (obj) {
	    return _Type_.isArray(obj) || typeof Array.isArray !== 'undefined' && Array.isArray(obj);
	};
	// date 和 RegExp的判断必须要在 toString函数执行之前
	Type.isDate = function (obj) {
	    return obj instanceof Date || _Type_.isDate(obj);
	};
	Type.isRegExp = function (obj) {
	    return obj instanceof RegExp || _Type_.isRegExp(obj);
	};
	Type.isError = function (obj) {
	    return _Type_.isError(obj) || obj instanceof Error;
	};
	Type.isSyntaxError = function (obj) {
	    return _Type_.isSyntaxError(obj) || obj instanceof SyntaxError;
	};
	Type.isTypeError = function (obj) {
	    return _Type_.isTypeError(obj) || obj instanceof TypeError;
	};
	Type.isRangeError = function (obj) {
	    return _Type_.isRangeError(obj) || obj instanceof RangeError;
	};

	// isObject:这里采用原生关键字typeof判定，即：数组，任何自定义类型，都属于Object
	/* eg:
	   function Person(){};
	   var p1 = new Person();
	   Type.isObject(p1);//true
	   Type.isObject(Person);//false, function
	   Type.isObject("12aa");//false, string is primitive type
	   Type.isObject([1,2,3]);//true, array is object via 'typeof'
	*/
	Type.isObject = function (obj) {
	    return (typeof obj === "object" || obj instanceof Object) && obj !== null;
	};
	Type.isFunction = function (obj) {
	    return typeof obj === "function" || obj instanceof Function;
	};
	Type.isNull = function (obj) {
	    return obj === null;
	};
	Type.isUndefined = function (obj) {
	    return obj === undefined;
	};
	Type.isUndefinedOrNull = Type.isNullOrUndefined = function (obj) {
	    return obj === null || obj === undefined;
	};
	Type.isBoolean = function (obj) {
	    return obj === true || obj === false || obj instanceof Boolean;
	};
	Type.isString = function (obj) {
	    return typeof obj === "string" || obj instanceof String;
	};
	Type.isChar = function (obj) {
	    return Type.isString(obj) && obj.length === 1;
	};
	Type.isNumber = function (obj, warn) {
	    warn = warn === undefined ? true : !!warn; //default true
	    if (warn && obj !== obj) {
	        // warning when NaN
	        console.warn("obj is NaN. Using 'Type.isRealNumber(obj)' instead of 'Type.isNumber(obj)'\nOr using 'Type.isNumber(obj,false)' to stop warning out\n");
	    }
	    return typeof obj === "number" || obj instanceof Number;
	};
	Type.isNaN = function (obj) {
	    return obj !== obj;
	};
	Type.isRealNumber = function (obj) {
	    return !Type.isNaN(obj) && Type.isNumber(obj);
	};
	// 检查是否为简单类型：除开function和object之外的所有类型均为简单类型
	Type.isPrimitive = function (obj) {
	    return !Type.isObject(obj) && !Type.isFunction(obj);
	};
	// 是否还可以再展开: Object,Array,以及某些Function
	Type.isSpreadable = function (obj) {
	    if (Type.isArray(obj)) {
	        return !!obj.length;
	    } else if (Type.isObject(obj) || Type.isFunction(obj)) {
	        for (var j in obj) {
	            if (obj.hasOwnProperty(j)) {
	                return true;
	            }
	        }
	    }
	    return false;
	};
	// 递归函数判断是否为json
	function _isJSON(value, visited) {
	    (visited || (visited = [])).push(value);
	    return Type.isPrimitive(value) || Type.isArray(value) && value.every(function (element) {
	        return _isJSON(element, visited);
	    }) || Type.isObject.isFlat(value) && Object.keys(value).every(function (key) {
	        var $ = Object.getOwnPropertyDescriptor(value, key);
	        return (!Type.isObject($.value) || !~visited.indexOf($.value)) && !('get' in $) && !('set' in $) && _isJSON($.value, visited);
	    });
	}
	// isJSON
	Type.isJSON = function (obj) {
	    return _isJSON(obj);
	};
	// isObject.isEmpty
	Type.isObject.isEmpty = function (obj, ownCheck) {
	    if (!Type.isObject(obj) && !Type.isArray(obj)) {
	        return false;
	    }
	    ownCheck = ownCheck || false;
	    for (var k in obj) {
	        if (ownCheck) {
	            if (obj.hasOwnProperty(k)) {
	                return false;
	            }
	        } else {
	            return false;
	        }
	    }
	    return true;
	};
	// isObject.isEmptyOwn: return true if has none own property
	Type.isObject.isEmptyOwn = function (obj) {
	    return Type.isObject.isEmpty(obj, true);
	};
	/*
	 flat (对象的直接来源 `Object.prototype` or `null`).
	 eg:
	 isFlat({}) // true
	 isFlat(new Type()) // false
	 */
	Type.isObject.isFlat = function (obj) {
	    if (Type.isNull(obj)) {
	        return true;
	    } else if (Type.isObject(obj)) {
	        return null === Object.getPrototypeOf(obj) || null === Object.getPrototypeOf(Object.getPrototypeOf(obj));
	    } else {
	        return false;
	    }
	};
	// decimal 浮点
	Type.isNumber.decimal = function (obj) {
	    return !Type.isNaN(obj) && Type.isNumber(obj) && obj % 1 !== 0;
	};
	// integer 整型
	Type.isNumber.integer = function (obj) {
	    return !Type.isNaN(obj) && Type.isNumber(obj) && obj % 1 === 0;
	};
	// 奇数
	Type.isNumber.odd = function (obj) {
	    return !Type.isNaN(obj) && Type.isNumber(obj) && obj % 2 !== 0; //这里判断不使用位操作符&，因为会使得一些特殊数如Infinity的结果不对
	};
	// 偶数
	Type.isNumber.even = function (obj) {
	    return !Type.isNaN(obj) && Type.isNumber(obj) && obj % 2 === 0;
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
	 *    Type.isInstanceOf(NaN,Number);// false
	 */
	// isInstanceOf
	function _instOf(value, type) {
	    // 先用原生instanceof判断
	    var isInstanceOf = value instanceof type;
	    // 对于非undefined和非null的value，需要再用构造器名称判断，以避免原生instanceof的判定
	    var isConstructorNameSame, isConstructorSourceSame;
	    if (!isInstanceOf && undefined !== value && null !== value) {
	        isConstructorNameSame = value.constructor && value.constructor.name === type.name;
	        isConstructorSourceSame = value.constructor && String(value.constructor) == String(type);
	        isInstanceOf = isConstructorNameSame && isConstructorSourceSame;
	        isInstanceOf = isInstanceOf || _instOf(Object.getPrototypeOf(value), type);
	    }
	    return isInstanceOf;
	}
	Type.isInstanceOf = _instOf;

	// exports
	module.exports = Type;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var travelJson = __webpack_require__(1);
	/**
	 * check circular obj
	 * @param obj
	 * @returns {{isCircular: boolean, circularProps: Array}}
	 */
	function checkCircular(obj) {
	    var isCcl = false;
	    var cclKeysArr = [];
	    travelJson(obj, function (k, v, kp, ts, cpl, cd, isCircular) {
	        if (isCircular) {
	            isCcl = true;
	            cclKeysArr.push({
	                keyPath: kp,
	                circularTo: v.slice(11, -1),
	                key: k,
	                value: v
	            });
	        }
	    }, "ROOT", true);
	    return {
	        isCircular: isCcl,
	        circularProps: cclKeysArr
	    };
	}

	module.exports = checkCircular;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Type = __webpack_require__(2);
	/**
	 * 通过keypath获取json的值，eg getValByKey({a:{b:{c:1}}}, "a.b.c") = 1
	 * @param json
	 * @param keyPath
	 * @param ownKeyCheck
	 * @returns {*}
	 * 注意：没办法支持 路径中带有 a.b.c[1][2]这样的形式，建议写成a.b.c.1.2
	 * a.b.c[1][2]这样的形式会被解析成 "a","b","c[1][2]"这样的属性名称
	 * 这里之所以不支持这样的原因是：
	 * 字符'['和']'也是可以作为属性名称存在的
	 * a ={
	 *    "c[1][2]": 1
	 * }
	 * 只能通过'.'操作符来进行分割
	 * 然后，对于属性名称中，已经含有'.'的，要转化写法变成'&bull;'
	 * 对于属性名中含有'&'的，需要转化成'&amp;',这样一来，如果属性名中含有'&bull;'，可以转化写成'&amp;bull;'
	 */
	function getValByKey(json, keyPath, ownKeyCheck) {

	    if (!Type.isObject(json) || !Type.isString(keyPath)) {
	        throw new TypeError("Error type-in,check plz! (jsonObj,stringKeyPath)");
	    }
	    ownKeyCheck = Type.isNullOrUndefined(ownKeyCheck) ? true : !!ownKeyCheck;
	    var v = json;
	    var propsArr = keyPath.split(".");
	    // var hasArrFlag = /\[|]/g;
	    // var outPrint = "obj['" + propsArr.join("']['") + "'] ",
	    //     needWarn = false;
	    propsArr.forEach(function (k) {
	        // if(!!k.match(hasArrFlag)){ needWarn = true; }
	        if (!Type.isNullOrUndefined(v)) {
	            k = k.replace(/&bull;/g, "."); //&bull; -> .
	            k = k.replace(/&amp;/g, "&"); //&amp; -> &  eg:如果你需要'&bull;'这个组合，可以写成'&amp;bull'
	            v = !ownKeyCheck ? v[k] : v.hasOwnProperty(k) ? v[k] : undefined;
	        } else {
	            return v;
	        }
	    });
	    // needWarn && console.warn("It was deprecated that put char '[' or ']' in your keyPath,or in you property name");
	    // needWarn && console.log(outPrint + " = " , v);
	    return v;
	}

	module.exports = getValByKey;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Type = __webpack_require__(2),
	    travelJson = __webpack_require__(1);
	/**
	 * 缩略字符串
	 * @param str
	 * @returns {*|string}
	 */
	function trimRight(str) {
	    return str.replace(/(\s|\u00A0)+$/, "");
	}

	/**
	 * 将string进行转义输出
	 */
	// https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
	var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    meta = { // table of character substitutions
	    '\b': '\\b',
	    '\t': '\\t',
	    '\n': '\\n',
	    '\f': '\\f',
	    '\r': '\\r',
	    '"': '\\"',
	    '\\': '\\\\'
	};
	function escapeString(string) {
	    // If the string contains no control characters, no quote characters, and no
	    // backslash characters, then we can safely slap some quotes around it.
	    // Otherwise we must also replace the offending characters with safe escape
	    // sequences.
	    escapable.lastIndex = 0; //复原
	    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	        var c = meta[a];
	        return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	    }) + '"' : '"' + string + '"';
	}
	// console.log(escapeString("english中文汉字博大精神\n\t\r\"\f\b"));

	// 不可用正则中的字符代替，如果需要，请转义
	// _TreeChar_中的字符与后面的正则逻辑强相关，请勿更改，请勿有重复的value
	var _TreeChar_ = {
	    "I": "│",
	    "T": "├",
	    "L": "└",
	    "_": "─",
	    "SPLIT": ":",
	    "1": " ",
	    "2": "  ",
	    "3": "   ",
	    "4": "    ",
	    "5": "     ",
	    "6": "      ",
	    "7": "       ",
	    "8": "        ",
	    "9": "         ",
	    "10": "          "
	};

	// char里面不要包含特殊正则字符，如果有，请转义
	function _isStartWith(char) {
	    var c = "";
	    if (Type.isArray(char)) {
	        c = char.join("|");
	    } else {
	        c = char || c;
	    }
	    var reg = new RegExp("^(" + c + ")+");
	    return function (str) {
	        return Type.isString(str) && !!str.match(reg);
	    };
	}
	// 是否为节点：父或者子节点
	var isNodeStr = _isStartWith([_TreeChar_.T, _TreeChar_.L, "ROOT"]);

	// 检查是否包含连接符号
	var _RegTreeLinkChars = new RegExp("^(" + [_TreeChar_.I, _TreeChar_.T, _TreeChar_._, _TreeChar_.L].join("|") + ")", "g");
	function _hasTreeLinkChar(str) {
	    return Type.isString(str) && str.match(_RegTreeLinkChars);
	}
	// 替换值中包含的连接符号
	var _Reg_I_ = new RegExp("^" + _TreeChar_.I, "g"),
	    _Reg_T_ = new RegExp("^" + _TreeChar_.T, "g"),
	    _Reg_L_ = new RegExp("^" + _TreeChar_.L, "g"),
	    _Reg___ = new RegExp("^" + _TreeChar_._, "g");
	var _repl_I_ = "'" + _TreeChar_.I + "'",
	    _repl_T_ = "'" + _TreeChar_.T + "'",
	    _repl_L_ = "'" + _TreeChar_.L + "'",
	    _repl___ = "'" + _TreeChar_._ + "'";
	function replaceTreeLinkChar(str) {
	    if (!!_hasTreeLinkChar(str)) {
	        return str.replace(_Reg_I_, _repl_I_).replace(_Reg_T_, _repl_T_).replace(_Reg_L_, _repl_L_).replace(_Reg___, _repl___);
	    }
	    return str;
	}

	//通过二维数组检查兄弟节点情况
	function checkNextSibling(w, h, arr) {
	    if (!Type.isArray(arr)) {
	        throw new TypeError("arr is not a array!");
	    }
	    var i,
	        hasNextSibling = false;
	    for (i = h + 1; i < arr.length; i++) {
	        if (!Type.isUndefined(arr[i]) && !Type.isArray(arr[i])) {
	            throw new TypeError("arr is not a two-dimensional-array !");
	        }

	        var ele = arr[i][w];
	        if (undefined === ele) {
	            break;
	        } else if (isNodeStr(ele + "")) {
	            hasNextSibling = true;
	            break;
	        }
	    }
	    return {
	        "wPos": w,
	        "hPos": i,
	        "isLast": !hasNextSibling
	    };
	}
	//修复简单粗暴生成的二位数字，以便生成正确的节点连接符
	function fixArr(arr) {
	    if (!Type.isArray(arr)) {
	        throw new TypeError("arr is not a array!");
	    }
	    var regNode = new RegExp("^" + _TreeChar_.T, "g"),
	        regVert = new RegExp("^" + _TreeChar_.I, "g"),
	        S = " ";
	    var i,
	        iLen = arr.length;
	    for (i = 0; i < iLen; i++) {
	        var row = arr[i];
	        if (!Type.isArray(row)) {
	            throw new TypeError("arr is not a two-dimensional-array !");
	        }
	        var j,
	            jLen = row.length;
	        for (j = 0; j < jLen; j++) {
	            var o = row[j];
	            if (undefined !== o && isNodeStr(o)) {
	                // 开始检查，且仅检查节点
	                var checkNext = checkNextSibling(j, i, arr);
	                if (checkNext.isLast) {
	                    arr[i][j] = o.replace(regNode, _TreeChar_.L); // "├" => "└"
	                    var c,
	                        cLen = checkNext.hPos;
	                    for (c = i + 1; c < cLen; c++) {
	                        if (arr[c]) {
	                            if (!!arr[c][j] && !!arr[c][j].match(regVert)) {
	                                arr[c][j] = arr[c][j].replace(regVert, S); // "│" => " "
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }

	    // 最后修正根节点: "└" => "", "─" => " "
	    var regSimRoot1 = new RegExp(_TreeChar_._, "gi"),
	        regSimRoot2 = new RegExp(_TreeChar_.T + "|" + _TreeChar_.L, "g");
	    arr[0][0] = arr[0][0].replace(regSimRoot1, " ").replace(regSimRoot2, "");

	    return arr;
	}
	// 重复产生n和char并组成字符串返回
	function repeatChar(char, n) {
	    var res = "";
	    char = Type.isChar(char) ? char : "*";
	    n = parseInt(n) || 0;
	    n = n > 0 ? n : 0;
	    if (n > 0) while (n--) res += char;
	    return res;
	}

	/**
	 * 将json对象转换成树状形式的字符串
	 *   view process with 'example/img/flow.png'
	 * @param {Object} json
	 * @param  {Object} options
	 *         {String} options.rootName
	 *    {char|Number} options.space  [1,8]
	 *         {Number} options.vSpace [0,2]
	 *        {Boolean} options.valueOut
	 * @returns {string} a tree-like string
	 */
	function treeString(json, options) {

	    // config
	    options = options || {};
	    var jsonName, space, vSpace, needValueOut; //不做空值保护，后面挨个做
	    jsonName = options.rootName;
	    space = options.space;
	    vSpace = options.vSpace;
	    needValueOut = options.valueOut;

	    // 根节点名称
	    jsonName = (Type.isString(jsonName) ? jsonName : 0) || "ROOT";
	    if (Type.isNullOrUndefined(json)) {
	        return jsonName + "'s content is " + String(json);
	    } else if (Type.isObject.isEmptyOwn(json)) {
	        return jsonName + "'s content is empty!";
	    } else if (!Type.isSpreadable(json)) {
	        return jsonName + "'s content is " + (Type.isString(json) ? escapeString(json) || String(json) : String(json)) || "empty!";
	    }
	    // 间距
	    var _SPACE_ = space;
	    if ("\t" !== space) {
	        space = parseInt(space);
	        space = Type.isNaN(space) ? 3 : space;
	        space = space <= 0 ? 1 : space > 8 ? 8 : space; //1 <= space <= 8
	        _SPACE_ = _TreeChar_[space];
	    } else {
	        _SPACE_ = "" + (space || " ");
	        space = 1;
	    }
	    vSpace = parseInt(vSpace);
	    vSpace = Type.isNaN(vSpace) ? space > 5 ? 2 : 1 : vSpace;
	    vSpace = vSpace < 0 ? 0 : vSpace > 2 ? 2 : vSpace; //0 <= vSpace <= 2
	    // 是否需要输出值
	    needValueOut = Type.isNullOrUndefined(needValueOut) ? true : !!needValueOut;

	    var rpN = parseInt((space - 1) / 2); //为了美观一点，控制节点间距 1->0 2->0 3->1 4->1 5->2 6->2 7->3 8->3
	    var _I_ = _TreeChar_.I + _SPACE_,
	        //连接符
	    _T_ = _TreeChar_.T + repeatChar(_TreeChar_._, rpN) + " ",
	        //叶节点
	    SPLIT = _TreeChar_.SPLIT + " "; //尾叶节点
	    var ft = Math.floor(jsonName.length / 2) % 10; // 左间距 max 10
	    var _rT_ = _TreeChar_.T + " "; //求取根节点的符号
	    var _I1_ = _TreeChar_.I + repeatChar(" ", ft - 1); // 最左边的符号和间距

	    //res:用于存储节点信息的二维数组,末尾显式加上值undefined来区分是否为父节点
	    var res = [[_rT_ + jsonName, undefined] //加上 _T_ 开头是为了表明这是一个节点，为了fixArr做准备
	    ];
	    if (vSpace > 0) {
	        var q;
	        for (q = 0; q < vSpace; q++) {
	            res.push([_I1_, _I_]); //此行元素用以增加根节点之下的连字符的竖直距离
	        }
	    }

	    // travel
	    travelJson(json, function (key, value, curKeyPath, typeStr, isSpreadable, curDepth) {
	        var depth = curDepth;
	        var v;
	        if (!isSpreadable) {
	            if (needValueOut) {
	                if (typeStr === "string") {
	                    // 如果v值中就包含了特殊连接符号，需要转换一下
	                    v = replaceTreeLinkChar(value); //v = value; //其实不转也行的
	                    v = escapeString(v) || String(v);
	                } else if (typeStr === "array") {
	                    //空数组
	                    v = "[]";
	                } else if (typeStr == "object") {
	                    //空对象
	                    v = "{}";
	                } else if (typeStr === "function") {
	                    v = "[function code]";
	                } else {
	                    v = String(value);
	                }
	                // 只有叶子节点才放值，父节点放undefined,采用显式赋值undefined作为父节点的标识（显式加入undefined元素可以占一个位置，会增加数组的length）
	                v = SPLIT + v;
	            } else {
	                // 不输出值，（此时应该是空字符串，而非undefined!，不然跟父节点混淆了）
	                v = "";
	            }
	        } else {
	            // 显式的赋值undefined，仅仅是为了标识区别出‘可拓展节点’（含有子属性的父节点）
	            v = undefined;
	        }
	        // 一横行：res[n]
	        var lineArr = [],
	            i;
	        for (i = 1; i < depth; i++) {
	            // 左边缩进用的元素
	            lineArr.push(i === 1 ? _I1_ : _I_); //首元素加入的是_I1_
	        }
	        lineArr.push(_T_ + escapeString(key).slice(1, -1)); // 节点名
	        lineArr.push(v); // 节点值

	        // 保存行信息
	        res.push(lineArr);

	        // 竖直方向上的间距
	        var vs;
	        for (vs = 0; vs < vSpace; vs++) {
	            // 增加一行竖直方向上的距离
	            res.push(lineArr.map(function (item, index) {
	                var isFirst = index === 0,
	                    //首元素加入的是_I1_
	                isLast = index === lineArr.length - 1,
	                    isSpreadableNodeEndFlag = isLast && item === undefined;
	                return index < lineArr.length - 1 || isSpreadableNodeEndFlag ? isFirst ? _I1_ : _I_ : undefined;
	            }));
	        }
	    }, "obj");

	    // 修正节点连接符
	    fixArr(res);

	    // 打印输出
	    // var color = require("./cli/colorful");
	    // res.forEach(function(item){
	    //     var strOut = "[";
	    //     item.forEach(function(sub,subIndex){
	    //         strOut += ((sub===undefined?color.magenta("undefined"):color.yellow("'"+sub+"'"))  + (subIndex===(item.length-1) ? "" : ", "));
	    //     });
	    //     strOut += "]";
	    //     console.log(strOut);
	    // });

	    return res.map(function (item) {
	        return trimRight(item.join("")); //item.join("");
	    }).join("\r\n"); // '\r' just for windows
	    // 可以考虑在完全生成之后，做replace替换那几个特殊字符，以便完成自定义连接符
	}

	// exports
	module.exports = treeString;

/***/ }
/******/ ])
});
;