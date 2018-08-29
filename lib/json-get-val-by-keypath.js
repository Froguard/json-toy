let {isObject, isString, isNill} = require("./typeOf");
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
function getValByKey(json,keyPath, ownKeyCheck){

    if(!isObject(json) || !isString(keyPath)){
        throw new TypeError("Error type-in,check plz! (jsonObj,stringKeyPath)");
    }
    ownKeyCheck = isNill(ownKeyCheck) ? true : !!ownKeyCheck;
    let v = json;
    let propsArr = keyPath.split(".");
    // let hasArrFlag = /\[|]/g;
    // let outPrint = "obj['" + propsArr.join("']['") + "'] ",
    //     needWarn = false;
    propsArr.forEach(function(k){
        // if(!!k.match(hasArrFlag)){ needWarn = true; }
        if(!isNill(v)){
            k = k.replace(/&bull;/g,".");//&bull; -> .
            k = k.replace(/&amp;/g,"&"); //&amp; -> &  eg:如果你需要'&bull;'这个组合，可以写成'&amp;bull'
            v = !ownKeyCheck ? v[k] : (v.hasOwnProperty(k) ? v[k] : undefined);
        }else{
            return v;
        }
    });
    // needWarn && console.warn("It was deprecated that put char '[' or ']' in your keyPath,or in you property name");
    // needWarn && console.log(outPrint + " = " , v);
    return v;
}

module.exports = getValByKey;

