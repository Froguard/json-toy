let {getTypeOf, isObject, isFunction, isString, isSpreadable} = require("./typeOf");
/**
 * 递归遍历一个json
 * @param {Object} json
 * @param {Function} cb callback(key,val,curKeyPath,typeStr,isComplexObj,curDepth,isCircular) and context is parent obj
 * @param {string} rootAlias
 * @param {Boolean} safeMode default is true
 * @returns {Array} keysArr
 */
function travelJson(json,cb,rootAlias,safeMode){
    if(!isObject(json)){ throw new TypeError("The first param should be an Object instance!"); }
    // 安全模式
    safeMode = safeMode===undefined ? true : !!safeMode;
    let safeStack = [];//记录safe检查时候的对象
    let safeKeys = []; //记录safe检查时候的key值
    // res
    let keysArr = [];
    let needCb = isFunction(cb);
    rootAlias = (isString(rootAlias) ? rootAlias : "") || "ROOT";
    // loop
    function travel(obj,curKeyPath,depth,cb){
        if(obj!==null && obj!==undefined){
            // safeMode
            if(safeMode){
                let objIndex = safeStack.indexOf(obj);
                if(~objIndex){// ~-1 == 0
                    safeStack.splice(objIndex + 1);// pop
                    safeKeys.splice(objIndex + 1);// pop
                }else{
                    safeStack.push(obj);// push
                    safeKeys.push(curKeyPath);
                }
            }
            // loop
            let keys = Object.keys(obj);
            const lastIndex = keys.length - 1;
            keys.forEach(function(k, i){
                let isFirstChild = i === 0;
                let isLastChild = i === lastIndex;
                // --- begin --
                //这里即使curKeyPath为空字符串""也请加上".",这样做是为了统一的循环次数，不管rootAlias是否为空字符串""
                let newKeyPath = curKeyPath + "." + k;
                keysArr.push(newKeyPath+"");//push a new string
                // 记录下层级
                let curDepth = depth + 1;
                // 值
                let v = obj[k];
                let isCircular = false;
                // safeMode
                if(safeMode){
                    let kIndex = safeStack.indexOf(v);
                    if(~kIndex){// Circular
                        isCircular = true;
                        v = "[Circular->" + safeKeys[kIndex] + "]";
                    }else{
                        isCircular = false;
                        v = obj[k];
                    }
                }
                // 是否可以再展开，这里，函数被视为不可再展开
                let spreadable  = isSpreadable(v) && !isFunction(v);
                // do sth in callback...
                needCb && cb.call(obj,k,v,newKeyPath+"",getTypeOf(v),spreadable,curDepth,isCircular,isFirstChild,isLastChild);
                // then travel in deep
                if(spreadable){
                    travel(v,newKeyPath,curDepth,cb);
                }
                // --- end --
            });


        }
    }
    // do on catch mode
    try{
        travel(json, rootAlias || "", 1, cb);// 栈溢出，递归次数导致内存超限
    }catch(eTravel){
        try{
            JSON.stringify(json);
        }catch(eStringify){
            throw eStringify;
        }
        throw eTravel;
    }
    return keysArr;
}

module.exports = travelJson;
