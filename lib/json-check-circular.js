let travelJson = require('./json-travel');
/**
 * check circular obj
 * @param obj
 * @returns {{isCircular: boolean, circularProps: Array}}
 */
function checkCircular(obj){
    let isCcl = false;
    let cclKeysArr = [];
    travelJson(obj,function(k,v,kp,ts,cpl,cd,isCircular){
        if(isCircular){
            isCcl = true;
            cclKeysArr.push({
                keyPath: kp,
                circularTo: v.slice(11,-1),
                key: k,
                value: v
            });
        }
    },"ROOT",true);
    return {
        isCircular: isCcl,
        circularProps: cclKeysArr
    };
}


module.exports = checkCircular;
