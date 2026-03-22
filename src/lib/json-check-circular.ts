import { travelJson } from './json-travel';

interface CircularProperty {
    keyPath: string;
    circularTo: string;
    key: string;
    value: string;
}

interface CircularCheckResult {
    isCircular: boolean;
    circularProps: CircularProperty[];
}

/**
 * check circular obj
 * @param obj
 * @returns {{isCircular: boolean, circularProps: Array}}
 */
export function checkCircular(obj: any): CircularCheckResult {
    let isCcl = false;
    let cclKeysArr: CircularProperty[] = [];
    
    travelJson(obj, (k: string, v: any, { keyPath, isCircular }: { keyPath: string; isCircular: boolean }) => {
        if(isCircular && typeof v === 'string') {
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