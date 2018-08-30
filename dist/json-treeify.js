/*!
 * Froguard(figure_wf@163.com)
 * https://github.com/Froguard/json-toy
 * license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jsonTreeify"] = factory();
	else
		root["jsonTreeify"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/json-treeify.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/json-travel.js":
/*!****************************!*\
  !*** ./lib/json-travel.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(/*! ./type-of */ 0),
    getTypeOf = _require.getTypeOf,
    isObject = _require.isObject,
    isFunction = _require.isFunction,
    isString = _require.isString,
    isSpreadable = _require.isSpreadable;

function travelJson(json, cb, rootAlias, safeMode) {
  if (!isObject(json)) {
    throw new TypeError("The first param should be an Object instance!");
  }

  safeMode = safeMode === undefined ? true : !!safeMode;
  var safeStack = [];
  var safeKeys = [];
  var keysArr = [];
  var needCb = isFunction(cb);
  rootAlias = (isString(rootAlias) ? rootAlias : "") || "ROOT";

  function travel(obj, curKeyPath, depth, cb) {
    if (obj !== null && obj !== undefined) {
      if (safeMode) {
        var objIndex = safeStack.indexOf(obj);

        if (~objIndex) {
          safeStack.splice(objIndex + 1);
          safeKeys.splice(objIndex + 1);
        } else {
          safeStack.push(obj);
          safeKeys.push(curKeyPath);
        }
      }

      var keys = Object.keys(obj);
      var lastIndex = keys.length - 1;
      keys.forEach(function (k, i) {
        var isFirstChild = i === 0;
        var isLastChild = i === lastIndex;
        var newKeyPath = curKeyPath + "." + k;
        keysArr.push(newKeyPath + "");
        var curDepth = depth + 1;
        var v = obj[k];
        var isCircular = false;

        if (safeMode) {
          var kIndex = safeStack.indexOf(v);

          if (~kIndex) {
            isCircular = true;
            v = "[Circular->" + safeKeys[kIndex] + "]";
          } else {
            isCircular = false;
            v = obj[k];
          }
        }

        var spreadable = isSpreadable(v) && !isFunction(v);
        needCb && cb.call(obj, k, v, newKeyPath + "", getTypeOf(v), spreadable, curDepth, isCircular, isFirstChild, isLastChild);

        if (spreadable) {
          travel(v, newKeyPath, curDepth, cb);
        }
      });
    }
  }

  try {
    travel(json, rootAlias || "", 1, cb);
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

/***/ }),

/***/ "./lib/json-treeify.js":
/*!*****************************!*\
  !*** ./lib/json-treeify.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__(/*! ./type-of */ 0),
    isArray = _require.isArray,
    isString = _require.isString,
    isUndefined = _require.isUndefined,
    isNill = _require.isNill,
    isNaN = _require.isNaN,
    isChar = _require.isChar,
    isObject = _require.isObject,
    isSpreadable = _require.isSpreadable;

var travelJson = __webpack_require__(/*! ./json-travel */ "./lib/json-travel.js");

function trimRight(str) {
  return str.replace(/(\s|\u00A0)+$/, "");
}

var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    meta = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"': '\\"',
  '\\': '\\\\'
};

function escapeString(string) {
  escapable.lastIndex = 0;
  return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
    var c = meta[a];
    return typeof c === 'string' ? c : "\\u" + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"' : '"' + string + '"';
}

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

function _isStartWith(char) {
  var c = "";

  if (isArray(char)) {
    c = char.join("|");
  } else {
    c = char || c;
  }

  var reg = new RegExp("^(" + c + ")+");
  return function (str) {
    return isString(str) && !!str.match(reg);
  };
}

var isNodeStr = _isStartWith([_TreeChar_.T, _TreeChar_.L, "ROOT"]);

var _RegTreeLinkChars = new RegExp("^(" + [_TreeChar_.I, _TreeChar_.T, _TreeChar_._, _TreeChar_.L].join("|") + ")", "g");

function _hasTreeLinkChar(str) {
  return isString(str) && str.match(_RegTreeLinkChars);
}

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

function checkNextSibling(w, h, arr) {
  if (!isArray(arr)) {
    throw new TypeError("arr is not a array!");
  }

  var i,
      hasNextSibling = false;

  for (i = h + 1; i < arr.length; i++) {
    if (!isUndefined(arr[i]) && !isArray(arr[i])) {
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

function fixArr(arr) {
  if (!isArray(arr)) {
    throw new TypeError("arr is not a array!");
  }

  var regNode = new RegExp("^" + _TreeChar_.T, "g"),
      regVert = new RegExp("^" + _TreeChar_.I, "g"),
      S = " ";
  var i,
      iLen = arr.length;

  for (i = 0; i < iLen; i++) {
    var row = arr[i];

    if (!isArray(row)) {
      throw new TypeError("arr is not a two-dimensional-array !");
    }

    var j = void 0,
        jLen = row.length;

    for (j = 0; j < jLen; j++) {
      var o = row[j];

      if (undefined !== o && isNodeStr(o)) {
        var checkNext = checkNextSibling(j, i, arr);

        if (checkNext.isLast) {
          arr[i][j] = o.replace(regNode, _TreeChar_.L);
          var c = void 0,
              cLen = checkNext.hPos;

          for (c = i + 1; c < cLen; c++) {
            if (arr[c]) {
              if (!!arr[c][j] && !!arr[c][j].match(regVert)) {
                arr[c][j] = arr[c][j].replace(regVert, S);
              }
            }
          }
        }
      }
    }
  }

  var regSimRoot1 = new RegExp(_TreeChar_._, "gi"),
      regSimRoot2 = new RegExp(_TreeChar_.T + "|" + _TreeChar_.L, "g");
  arr[0][0] = arr[0][0].replace(regSimRoot1, " ").replace(regSimRoot2, "");
  return arr;
}

function repeatChar(char, n) {
  var res = "";
  char = isChar(char) ? char : "*";
  n = parseInt(n) || 0;
  n = n > 0 ? n : 0;
  if (n > 0) while (n--) {
    res += char;
  }
  return res;
}

function treeString(json, options) {
  options = options || {};
  var jsonName, space, vSpace, needValueOut, msRetrunChar;
  jsonName = options.rootName;
  space = options.space;
  vSpace = options.vSpace;
  needValueOut = options.valueOut;
  msRetrunChar = options.msRetrunChar || false;
  jsonName = (isString(jsonName) ? jsonName : 0) || "ROOT";

  if (isNill(json)) {
    return jsonName + "'s content is " + String(json);
  } else if (isObject.isEmptyOwn(json)) {
    return jsonName + "'s content is empty!";
  } else if (!isSpreadable(json)) {
    return jsonName + "'s content is " + (isString(json) ? escapeString(json) || String(json) : String(json)) || "empty!";
  }

  var _SPACE_ = space;

  if ("\t" !== space) {
    space = parseInt(space);
    space = isNaN(space) ? 3 : space;
    space = space <= 0 ? 1 : space > 8 ? 8 : space;
    _SPACE_ = _TreeChar_[space];
  } else {
    _SPACE_ = "" + (space || " ");
    space = 1;
  }

  vSpace = parseInt(vSpace);
  vSpace = isNaN(vSpace) ? space > 5 ? 2 : 1 : vSpace;
  vSpace = vSpace < 0 ? 0 : vSpace > 2 ? 2 : vSpace;
  needValueOut = isNill(needValueOut) ? true : !!needValueOut;
  var rpN = parseInt((space - 1) / 2);

  var _I_ = _TreeChar_.I + _SPACE_,
      _T_ = _TreeChar_.T + repeatChar(_TreeChar_._, rpN) + " ",
      SPLIT = _TreeChar_.SPLIT + " ";

  var ft = Math.floor(jsonName.length / 2) % 10;

  var _rT_ = _TreeChar_.T + " ";

  var _I1_ = _TreeChar_.I + repeatChar(" ", ft - 1);

  var res = [[_rT_ + jsonName, undefined]];

  if (vSpace > 0) {
    var q;

    for (q = 0; q < vSpace; q++) {
      res.push([_I1_, _I_]);
    }
  }

  travelJson(json, function (key, value, curKeyPath, typeStr, isSpreadable, curDepth) {
    var depth = curDepth;
    var v;

    if (!isSpreadable) {
      if (needValueOut) {
        if (typeStr === "string") {
          v = replaceTreeLinkChar(value);
          v = escapeString(v) || String(v);
        } else if (typeStr === "array") {
          v = "[]";
        } else if (typeStr === "object") {
          v = "{}";
        } else if (typeStr === "function") {
          v = "[function code]";
        } else {
          v = String(value);
        }

        v = SPLIT + v;
      } else {
        v = "";
      }
    } else {
      v = undefined;
    }

    var lineArr = [],
        i;

    for (i = 1; i < depth; i++) {
      lineArr.push(i === 1 ? _I1_ : _I_);
    }

    lineArr.push(_T_ + escapeString(key).slice(1, -1));
    lineArr.push(v);
    res.push(lineArr);
    var vs;

    for (vs = 0; vs < vSpace; vs++) {
      res.push(lineArr.map(function (item, index) {
        var isFirst = index === 0,
            isLast = index === lineArr.length - 1,
            isSpreadableNodeEndFlag = isLast && item === undefined;
        return index < lineArr.length - 1 || isSpreadableNodeEndFlag ? isFirst ? _I1_ : _I_ : undefined;
      }));
    }
  }, "obj");
  fixArr(res);
  return res.map(function (item) {
    return trimRight(item.join(""));
  }).join(msRetrunChar ? "\r\n" : "\n");
}

module.exports = treeString;

/***/ }),

/***/ 0:
/*!************************!*\
  !*** ./lib/type-of.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeString(obj) {
  return Object.prototype.toString.call(obj);
}

function _getType(obj) {
  if (obj === null || obj === undefined) {
    return obj === undefined ? "undefined" : "null";
  } else {
    var typeName = _typeString(obj).slice(8, -1).toLowerCase();

    var tpOf = typeof obj;

    if (typeName !== "arguments" && (tpOf === "object" || tpOf === "function")) {
      typeName = obj.constructor && obj.constructor.name ? obj.constructor.name.toLowerCase() : typeName;
    }

    return typeName;
  }
}

function _isTypeOf(type) {
  type = (typeof type === "string" || type instanceof String ? type : "").toLowerCase();
  return function (obj) {
    return type === _getType(obj);
  };
}

var _Type_ = {};
["arguments", "array", "date", "error", "syntaxError", "typeError", "rangeError", "regExp", "symbol", "set", "weakSet", "map", "weakMap"].forEach(function (t) {
  _Type_["is" + t[0].toUpperCase() + t.substr(1)] = _isTypeOf(t);
});
var isArguments = _Type_.isArguments;
var isSymbol = _Type_.isSymbol;
var isSet = _Type_.isSet;
var isWeakSet = _Type_.isWeakSet;
var isMap = _Type_.isMap;
var isWeakMap = _Type_.isWeakMap;

function isArray(obj) {
  return _Type_.isArray(obj) || typeof Array.isArray !== 'undefined' && Array.isArray(obj);
}

function isDate(obj) {
  return obj instanceof Date || _Type_.isDate(obj);
}

function isRegExp(obj) {
  return obj instanceof RegExp || _Type_.isRegExp(obj);
}

function isError(obj) {
  return _Type_.isError(obj) || obj instanceof Error;
}

function isSyntaxError(obj) {
  return _Type_.isSyntaxError(obj) || obj instanceof SyntaxError;
}

function isTypeError(obj) {
  return _Type_.isTypeError(obj) || obj instanceof TypeError;
}

function isRangeError(obj) {
  return _Type_.isRangeError(obj) || obj instanceof RangeError;
}

function isObject(obj) {
  return (typeof obj === "object" || obj instanceof Object) && obj !== null;
}

function isFunction(obj) {
  return typeof obj === "function" || obj instanceof Function;
}

function isNull(obj) {
  return obj === null;
}

function isUndefined(obj) {
  return obj === undefined;
}

function isNill(obj) {
  return obj === null || obj === undefined;
}

function isBoolean(obj) {
  return obj === true || obj === false || obj instanceof Boolean;
}

function isString(obj) {
  return typeof obj === "string" || obj instanceof String;
}

function isChar(obj) {
  return isString(obj) && obj.length === 1;
}

function isNumber(obj, warn) {
  warn = warn === undefined ? true : !!warn;

  if (warn && obj !== obj) {
    console.warn("obj is NaN. Using 'isRealNumber(obj)' instead of 'isNumber(obj)'\nOr using 'isNumber(obj,false)' to stop warning out\n");
  }

  return typeof obj === "number" || obj instanceof Number;
}

function isNaN(obj) {
  return obj !== obj;
}

function isRealNumber(obj) {
  return !isNaN(obj) && isNumber(obj);
}

function isPrimitive(obj) {
  return !isObject(obj) && !isFunction(obj);
}

function isSpreadable(obj) {
  if (isArray(obj)) {
    return !!obj.length;
  } else if (isObject(obj) || isFunction(obj)) {
    for (var j in obj) {
      if (obj.hasOwnProperty(j)) {
        return true;
      }
    }
  }

  return false;
}

function _isJSON(value, visited) {
  (visited || (visited = [])).push(value);
  return isPrimitive(value) || isArray(value) && value.every(function (element) {
    return _isJSON(element, visited);
  }) || isObject.isFlat(value) && Object.keys(value).every(function (key) {
    var $ = Object.getOwnPropertyDescriptor(value, key);
    return (!isObject($.value) || !~visited.indexOf($.value)) && !('get' in $) && !('set' in $) && _isJSON($.value, visited);
  });
}

function isJSON(obj) {
  return _isJSON(obj);
}

isObject.isEmpty = function (obj, ownCheck) {
  if (!isObject(obj) && !isArray(obj)) {
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

isObject.isEmptyOwn = function (obj) {
  return isObject.isEmpty(obj, true);
};

isObject.isFlat = function (obj) {
  if (isNull(obj)) {
    return true;
  } else if (isObject(obj)) {
    return null === Object.getPrototypeOf(obj) || null === Object.getPrototypeOf(Object.getPrototypeOf(obj));
  } else {
    return false;
  }
};

isNumber.decimal = function (obj) {
  return !isNaN(obj) && isNumber(obj) && obj % 1 !== 0;
};

isNumber.integer = function (obj) {
  return !isNaN(obj) && isNumber(obj) && obj % 1 === 0;
};

isNumber.odd = function (obj) {
  return !isNaN(obj) && isNumber(obj) && obj % 2 !== 0;
};

isNumber.even = function (obj) {
  return !isNaN(obj) && isNumber(obj) && obj % 2 === 0;
};

function _instOf(value, type) {
  var isInstanceOf = value instanceof type;
  var isConstructorNameSame, isConstructorSourceSame;

  if (!isInstanceOf && undefined !== value && null !== value) {
    isConstructorNameSame = value.constructor && value.constructor.name === type.name;
    isConstructorSourceSame = value.constructor && String(value.constructor) == String(type);
    isInstanceOf = isConstructorNameSame && isConstructorSourceSame;
    isInstanceOf = isInstanceOf || _instOf(Object.getPrototypeOf(value), type);
  }

  return isInstanceOf;
}

module.exports = {
  "typeStr": ((_typeString),null),
  getTypeOf: _getType,
  "isTypeOf": ((_isTypeOf),null),
  "isInstanceOf": ((_instOf),null),
  "isArguments": ((isArguments),null),
  "isSymbol": ((isSymbol),null),
  "isSet": ((isSet),null),
  "isWeakSet": ((isWeakSet),null),
  "isMap": ((isMap),null),
  "isWeakMap": ((isWeakMap),null),
  isArray: isArray,
  "isDate": ((isDate),null),
  "isRegExp": ((isRegExp),null),
  "isError": ((isError),null),
  "isSyntaxError": ((isSyntaxError),null),
  "isTypeError": ((isTypeError),null),
  "isRangeError": ((isRangeError),null),
  isObject: isObject,
  isFunction: isFunction,
  "isNull": ((isNull),null),
  isUndefined: isUndefined,
  isNill: isNill,
  "isNullOrUndefined": ((isNill),null),
  "isUndefinedOrNull": ((isNill),null),
  "isBoolean": ((isBoolean),null),
  isString: isString,
  isChar: isChar,
  "isNumber": ((isNumber),null),
  isNaN: isNaN,
  "isRealNumber": ((isRealNumber),null),
  "isPrimitive": ((isPrimitive),null),
  isSpreadable: isSpreadable,
  "isJSON": ((isJSON),null)
};

/***/ })

/******/ });
});