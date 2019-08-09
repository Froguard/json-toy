let travelJson = require('./json-travel');
/**
 * check circular obj
 * @param obj
 * @returns {{isCircular: boolean, circularProps: Array}}
 */
function checkCircular(obj){
    let isCcl = false;
    let cclKeysArr = [];
    travelJson(obj, (k, v, {keyPath, isCircular}) => {
        if(isCircular){
            isCcl = true;
            cclKeysArr.push({
                keyPath,
                circularTo: v.slice(11, -1), // value: '[Circular->xxx]'  ==>  circularTo: 'xxx'
                key: k,
                value: v
            });
        }
    }, 'ROOT', true);
    return {
        isCircular: isCcl,
        circularProps: cclKeysArr
    };
}

module.exports = checkCircular;