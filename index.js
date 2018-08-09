
var travelJson = require("./lib/json-travel"),
    checkCircular = require('./lib/json-check-circular'),
    getValByKeyPath = require("./lib/json-get-val-by-keypath"),
    treeString = require("./lib/json-toTreeString");

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
