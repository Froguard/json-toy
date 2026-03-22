import { getTypeOf, isObject, isFunction, isString, isSpreadable, isNill } from './type-of';

interface TravelCallbackInfo {
    keyPath: string;
    depth: number;
    type: string;
    isCircular: boolean;
    isSpreadable: boolean;
    isFirst: boolean;
    isLast: boolean;
}

type TravelCallback = (key: string, value: any, info: TravelCallbackInfo) => void;

/**
 * 递归遍历一个json
 * @param {Object} json
 * @param {Function} cb callback(key,val,curKeyPath,typeStr,isComplexObj,curDepth,isCircular) and context is parent obj
 * @param {string} rootAlias
 * @param {Boolean} safeMode default is true
 * @returns {Array} keysArr
 */
export function travelJson(
    json: any,
    cb?: TravelCallback,
    rootAlias?: string,
    safeMode: boolean = true
): string[] {
    if (!isObject(json)) {
        throw new TypeError('The first param should be an Object instance!');
    }

    const safeStack: any[] = []; // 记录safe检查时候的对象
    const safeKeys: string[] = []; // 记录safe检查时候的key值
    const keysArr: string[] = [];
    const needCb = isFunction(cb);
    rootAlias = (isString(rootAlias) ? rootAlias : '') || 'ROOT';

    function travel(obj: any, curKeyPath: string, depth: number, callback?: TravelCallback): void {
        if (!isNill(obj)) {
            // safeMode
            if (safeMode) {
                const objIndex = safeStack.indexOf(obj);
                if (objIndex !== -1) { // if found it
                    safeStack.splice(objIndex + 1); // delete all before it
                    safeKeys.splice(objIndex + 1); // delete all before it
                } else {
                    safeStack.push(obj); // push
                    safeKeys.push(curKeyPath);
                }
            }

            // loop
            const keys = Object.keys(obj);
            const lastIndex = keys.length - 1;
            
            keys.forEach((k, i) => {
                const isFirstChild = i === 0;
                const isLastChild = i === lastIndex;
                const newKeyPath = `${curKeyPath}.${k}`;
                keysArr.push(newKeyPath);

                const curDepth = depth + 1;
                let v = obj[k];
                let isCircular = false;

                // safeMode
                if (safeMode) {
                    const kIndex = safeStack.indexOf(v);
                    if (kIndex !== -1) { // Circular
                        isCircular = true;
                        v = `[Circular->${safeKeys[kIndex]}]`;
                    } else {
                        isCircular = false;
                        v = obj[k];
                    }
                }

                const spreadable = isSpreadable(v) && !isFunction(v);

                if (needCb && callback) {
                    callback.call(obj, k, v, {
                        keyPath: newKeyPath,
                        depth: curDepth,
                        type: getTypeOf(v),
                        isCircular,
                        isSpreadable: spreadable,
                        isFirst: isFirstChild,
                        isLast: isLastChild
                    });
                }

                if (spreadable) {
                    travel(v, newKeyPath, curDepth, callback);
                }
            });
        }
    }

    try {
        travel(json, rootAlias, 1, cb);
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