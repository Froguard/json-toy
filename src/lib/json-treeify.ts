import { isString, isNill, isNaN, isObject, isSpreadable } from './type-of';
import { travelJson } from './json-travel';

interface TreeifyOptions {
    jsonName?: string;
    space?: number | string;
    vSpace?: number;
    needValueOut?: boolean;
    msReturnChar?: boolean;
}

interface FormatedOptions extends Required<TreeifyOptions> {
    space: number;
    // vSpace: number;
}

interface TreeCharacters {
    I: string;
    T: string;
    L: string;
    _: string;
    SPLIT: string;
    [key: number|string]: string;
}

/*
 * escape string
 * https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
 */
const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
const meta: { [key: string]: string } = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
};

function escapeString(string: string): string {
    escapable.lastIndex = 0;
    return escapable.test(string) ? `"${string.replace(escapable, (a) => {
        const c = meta[a];
        return typeof c === 'string' ?
            c :
            `\\u${(`0000${a.charCodeAt(0).toString(16)}`).slice(-4)}`;
    })}"` : `"${string}"`;
}

const _TreeChar_: TreeCharacters = {
    I: '│',
    T: '├',
    L: '└',
    _: '─',
    SPLIT: ':',
    1: ' ',
    2: '  ',
    3: '   ',
    4: '    ',
    5: '     ',
    6: '      ',
    7: '       ',
    8: '        ',
    9: '         ',
    10: '          '
};

function _isStartWith(chars: string[]): (str: string) => boolean {
    const c = chars.join('|');
    const reg = new RegExp(`^(${c})+`);
    return function(str: string): boolean {
        return isString(str) && !!str.match(reg);
    };
}

const isNodeStr = _isStartWith([_TreeChar_.T, _TreeChar_.L, 'ROOT']);

const _RegTreeLinkChars = new RegExp(`^(${[_TreeChar_.I, _TreeChar_.T, _TreeChar_._, _TreeChar_.L].join('|')})`);

function replaceTreeLinkChar(str: string): string {
    const check = isString(str) && str.match(_RegTreeLinkChars);
    return check && check.length ? `'${check[1]}'${str.substr(1)}` : str;
}

interface CheckNextSiblingResult {
    wPos: number;
    hPos: number;
    isLast: boolean;
}

function checkNextSibling(w: number, h: number, arr: any[][]): CheckNextSiblingResult {
    let i: number;
    let hasNextSibling = false;
    for (i = (h + 1); i < arr.length; i++) {
        const ele = arr[i][w];
        if (ele === undefined) {
            break;
        } else if (isNodeStr(`${ele}`)) {
            hasNextSibling = true;
            break;
        }
    }
    return {
        wPos: w,
        hPos: i,
        isLast: !hasNextSibling
    };
}

function fixArr(arr: any[][]): any[][] {
    const regNode = new RegExp(`^${_TreeChar_.T}`, 'g');
    const regVert = new RegExp(`^${_TreeChar_.I}`, 'g');
    const S = ' ';
    
    for (let i = 0; i < arr.length; i++) {
        const row = arr[i];
        for (let j = 0; j < row.length; j++) {
            const o = row[j];
            if (isNodeStr(o)) {
                const checkNext = checkNextSibling(j, i, arr);
                if (checkNext.isLast) {
                    arr[i][j] = o.replace(regNode, _TreeChar_.L);
                    for (let c = i + 1; c < checkNext.hPos; c++) {
                        if (arr[c]) {
                            if (arr[c][j] && arr[c][j].match(regVert)) {
                                arr[c][j] = arr[c][j].replace(regVert, S);
                            }
                        }
                    }
                }
            }
        }
    }

    const regSimRoot1 = new RegExp(_TreeChar_._, 'gi');
    const regSimRoot2 = new RegExp(`${_TreeChar_.T}|${_TreeChar_.L}`, 'g');
    arr[0][0] = arr[0][0].replace(regSimRoot1, ' ').replace(regSimRoot2, '');

    return arr;
}

function repeatChar(char: string, n: number): string {
    let res = '';
    char = char.charAt(0);
    n = parseInt(String(n)) || 0;
    n = n > 0 ? n : 0;
    while (n--) {
        res += char;
    }
    return res;
}

function formatOption(options: TreeifyOptions = {}): FormatedOptions {
    const { jsonName, space, vSpace, needValueOut, msReturnChar } = options || {};
    
    const formattedJsonName = (isString(jsonName) ? jsonName : '') || 'ROOT';
    
    let formattedSpace: number;
    if (space === '\t') {
        formattedSpace = 1;
    } else {
        formattedSpace = parseInt(String(space));
        formattedSpace = isNaN(formattedSpace) ? 3 : formattedSpace;
        formattedSpace = formattedSpace <= 0 ? 1 : formattedSpace > 8 ? 8 : formattedSpace;
    }
    
    let formattedVSpace = parseInt(String(vSpace));
    formattedVSpace = isNaN(formattedVSpace) ? (formattedSpace > 5 ? 2 : 1) : formattedVSpace;
    formattedVSpace = formattedVSpace < 0 ? 0 : formattedVSpace > 2 ? 2 : formattedVSpace;
    
    const formattedNeedValueOut = isNill(needValueOut) ? true : !!needValueOut;
    
    return {
        jsonName: formattedJsonName,
        space: formattedSpace,
        vSpace: formattedVSpace,
        needValueOut: formattedNeedValueOut,
        msReturnChar: !!msReturnChar
    };
}

/**
 * treeify
 *   view process with 'example/img/flow.png'
 * @param {Object} json
 * @param  {Object} options
 *         {String} options.rootName
 *    {char|Number} options.space  [1,8]
 *         {Number} options.vSpace [0,2]
 *        {Boolean} options.valueOut
 *        {Boolean} options.msReturnChar '\r'
 * @returns {string} a tree-like string
 */
export function treeify(json: any, options: TreeifyOptions = {}): string {
    const { jsonName, space, vSpace, needValueOut, msReturnChar } = formatOption(options);

    if (isNill(json)) {
        return `${jsonName}'s content is ${String(json)}`;
    } else if ((isObject as any).isEmptyOwn(json)) {
        return `${jsonName}'s content is empty!`;
    } else if (!isSpreadable(json)) {
        return `${jsonName}'s content is ${isString(json) ? escapeString(json) : String(json)}`;
    }

    const _I_ = _TreeChar_.I + _TreeChar_[space];
    const _T_ = `${_TreeChar_.T + repeatChar(_TreeChar_._, Math.floor((space - 1) / 2))} `;
    const _L_ = `${_TreeChar_.L + repeatChar(_TreeChar_._, Math.floor((space - 1) / 2))} `;
    const SPLIT = `${_TreeChar_.SPLIT} `;
    const ft = (Math.floor(jsonName.length / 2)) % 10;
    const _rT_ = `${_TreeChar_.T} `;
    const _I1_ = _TreeChar_.I + repeatChar(' ', ft - 1);

    const res: any[][] = [
        [_rT_ + jsonName, undefined]
    ];

    for (let q = 0; q < vSpace; q++) {
        res.push([_I1_, _I_]);
    }

    travelJson(json, (key: string, value: any, option: any = {}) => {
        const { type, isSpreadable: isSpreadableFlag, depth, isLast } = option;
        const typeStr = type;
        let v: any;

        if (isSpreadableFlag) {
            v = undefined;
        } else {
            if (needValueOut) {
                if (typeStr === 'string') {
                    v = replaceTreeLinkChar(value);
                    v = escapeString(v);
                } else if (typeStr === 'array') {
                    v = '[]';
                } else if (typeStr === 'object') {
                    v = '{}';
                } else if (typeStr === 'function') {
                    v = '[function code]';
                } else {
                    v = String(value);
                }
                v = SPLIT + v;
            } else {
                v = '';
            }
        }

        const lineArr: any[] = [];
        for (let i = 1; i < depth; i++) {
            lineArr.push(i === 1 ? _I1_ : _I_);
        }
        lineArr.push((isLast ? _L_ : _T_) + escapeString(key).slice(1, -1));
        lineArr.push(v);

        res.push(lineArr);

        for (let vs = 0; vs < vSpace; vs++) {
            res.push(lineArr.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === (lineArr.length - 1);
                const isSpreadableNodeEndFlag = isLast && item === undefined;
                return index < (lineArr.length - 1) || isSpreadableNodeEndFlag ? (isFirst ? _I1_ : _I_) : undefined;
            }));
        }
    });

    const lineSplitChar = msReturnChar ? '\r\n' : '\n';
    return fixArr(res)
        .map(
          row => row.filter(item => item !== undefined).join('')
          .trimEnd()
        )
        .join(lineSplitChar);
} 