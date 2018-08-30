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
		exports["jsonCheckCircular"] = factory();
	else
		root["jsonCheckCircular"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/json-check-circular.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/json-check-circular.js":
/*!************************************!*\
  !*** ./lib/json-check-circular.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var travelJson = __webpack_require__(/*! ./json-travel */ "./lib/json-travel.js");

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

/***/ }),

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
  "isArray": ((isArray),null),
  "isDate": ((isDate),null),
  "isRegExp": ((isRegExp),null),
  "isError": ((isError),null),
  "isSyntaxError": ((isSyntaxError),null),
  "isTypeError": ((isTypeError),null),
  "isRangeError": ((isRangeError),null),
  isObject: isObject,
  isFunction: isFunction,
  "isNull": ((isNull),null),
  "isUndefined": ((isUndefined),null),
  "isNill": ((isNill),null),
  "isNullOrUndefined": ((isNill),null),
  "isUndefinedOrNull": ((isNill),null),
  "isBoolean": ((isBoolean),null),
  isString: isString,
  "isChar": ((isChar),null),
  "isNumber": ((isNumber),null),
  "isNaN": ((isNaN),null),
  "isRealNumber": ((isRealNumber),null),
  "isPrimitive": ((isPrimitive),null),
  isSpreadable: isSpreadable,
  "isJSON": ((isJSON),null)
};

/***/ })

/******/ });
});