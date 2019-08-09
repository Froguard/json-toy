let {/*isArray, */isString, /*isUndefined, */isNill, isNaN, isObject, isSpreadable} = require('./type-of');
let travelJson = require('./json-travel');

/*
 * escape string
 * https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
 */
// eslint-disable-next-line
let escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
function escapeString(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    escapable.lastIndex = 0;//复原
    return escapable.test(string) ? `"${string.replace(escapable, (a) => {
        let c = meta[a];
        return typeof c === 'string' ?
            c :
            `\\u${(`0000${a.charCodeAt(0).toString(16)}`).slice(-4)}`;
    })}"` : `"${string}"`;
}

let _TreeChar_ = {
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

function _isStartWith(chars){
    let c = chars.join('|');
    let reg = new RegExp(`^(${c})+`);
    return function(str){
        return isString(str) && !!str.match(reg);
    };
}
let isNodeStr = _isStartWith([_TreeChar_.T, _TreeChar_.L, 'ROOT']);

let _RegTreeLinkChars = new RegExp(`^(${[_TreeChar_.I, _TreeChar_.T, _TreeChar_._, _TreeChar_.L].join('|')})`);
function replaceTreeLinkChar(str){
    let check = isString(str) && str.match(_RegTreeLinkChars);
    return check && check.length ? `'${check[1]}'${str.substr(1)}` : str;
}

function checkNextSibling(w, h, arr){
    // if(!isArray(arr)){
    //     throw new TypeError("arr is not a array!");
    // }
    let i, hasNextSibling = false;
    for(i=(h+1); i<arr.length; i++){
        // if(!isUndefined(arr[i]) && !isArray(arr[i])){
        //     throw new TypeError("arr is not a two-dimensional-array !");
        // }
        let ele = arr[i][w];
        if(undefined===ele){
            break;
        }else if(isNodeStr(`${ele}`)){
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
//修复简单粗暴生成的二位数字，以便生成正确的节点连接符
function fixArr(arr){
    // if(!isArray(arr)){
    //     throw new TypeError("arr is not a array!");
    // }
    let regNode = new RegExp(`^${_TreeChar_.T}`, 'g'),
        regVert = new RegExp(`^${_TreeChar_.I}`, 'g'),
        S = ' ';
    let i, iLen = arr.length;
    for(i=0; i<iLen; i++){
        let row = arr[i];
        // if(!isArray(row)){
        //     throw  new TypeError("arr is not a two-dimensional-array !");
        // }
        for(let j=0; j<row.length; j++){
            let o = row[j];
            if(isNodeStr(o)){
                let checkNext = checkNextSibling(j, i, arr);
                if(checkNext.isLast){
                    arr[i][j] = o.replace(regNode, _TreeChar_.L);// "├" => "└"
                    for(let c=i+1; c<checkNext.hPos; c++){
                        if(arr[c]){
                            if(!!arr[c][j] && !!arr[c][j].match(regVert)){
                                arr[c][j] = arr[c][j].replace(regVert, S);// "│" => " "
                            }
                        }
                    }
                }
            }
        }
    }

    // fix root: "└" => "", "─" => " "
    let regSimRoot1 = new RegExp(_TreeChar_._, 'gi'),
        regSimRoot2 = new RegExp(`${_TreeChar_.T}|${_TreeChar_.L}`, 'g');
    arr[0][0] = arr[0][0].replace(regSimRoot1, ' ').replace(regSimRoot2, '');

    return arr;
}
//
function repeatChar(char, n){
    let res = '';
    char = char.charAt(0);
    n = parseInt(n) || 0;
    n = n > 0 ? n : 0;
    while(n--) {
        res += char;
    }
    return res;
}
//
function formatOption(options = {}){
    // config
    let {jsonName, space, vSpace, needValueOut, msReturnChar} = options || {};//不做空值保护，后面挨个做
    // root name
    jsonName = (isString(jsonName) ? jsonName : 0) || 'ROOT';
    // horizon space
    if('\t'!==space){
        space = parseInt(space);
        space = isNaN(space) ? 3 : space;
        space = space <= 0 ? 1 : space > 8 ? 8 : space;//1 <= space <= 8
    }else{
        space = 1;
    }
    // vertical space
    vSpace = parseInt(vSpace);
    vSpace = isNaN(vSpace) ? (space > 5 ? 2 : 1) : vSpace;
    vSpace = vSpace< 0 ? 0 : vSpace > 2 ? 2 : vSpace;//0 <= vSpace <= 2
    // whether value should print out
    needValueOut = isNill(needValueOut) ? true : !!needValueOut;
    return {jsonName, space, vSpace, needValueOut, msReturnChar};
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
function treeify(json, options){
    // config
    let {jsonName, space, vSpace, needValueOut, msReturnChar} = formatOption(options);

    // check json content
    if(isNill(json)){
        return `${jsonName}'s content is ${String(json)}`;
    }else if(isObject.isEmptyOwn(json)){
        return `${jsonName}'s content is empty!`;
    }else if(!isSpreadable(json)){
        return `${jsonName}'s content is ${isString(json) ? escapeString(json) : String(json)}`;
    }

    // 间距
    let _I_ = _TreeChar_.I + _TreeChar_[space],
        // 为了美观一点，控制节点间距 1->0 2->0 3->1 4->1 5->2 6->2 7->3 8->3
        _T_ = `${_TreeChar_.T + repeatChar(_TreeChar_._, parseInt((space - 1) / 2))} `,
        SPLIT = `${_TreeChar_.SPLIT} `;
    let ft = (Math.floor(jsonName.length / 2)) % 10; // 左间距 max 10
    let _rT_ = `${_TreeChar_.T} `; // 求取根节点的符号
    let _I1_ = _TreeChar_.I + repeatChar(' ', ft-1); // 最左边的符号和间距

    //res:用于存储节点信息的二维数组,末尾显式加上值undefined来区分是否为父节点
    let res = [
        [_rT_ + jsonName, undefined]
    ];
    for(let q=0; q < vSpace; q++){ // vertical-space
        res.push([_I1_, _I_]);
    }

    // travel
    travelJson(json, (key, value, curKeyPath, typeStr, isSpreadable, curDepth) => {
        let depth = curDepth;
        let v;
        if(!isSpreadable){
            if(needValueOut){
                if(typeStr==='string'){
                    // 如果v值中就包含了特殊连接符号，需要转换一下
                    v = replaceTreeLinkChar(value);//v = value; //其实不转也行的
                    v = escapeString(v);
                }else if(typeStr==='array'){
                    v = '[]';
                }else if(typeStr==='object'){
                    v = '{}';
                }else if(typeStr==='function'){
                    v = '[function code]';
                }else{
                    v = String(value);
                }
                // 只有叶子节点才放值，父节点放undefined,采用显式赋值undefined作为父节点的标识（显式加入undefined元素可以占一个位置，会增加数组的length）
                v = SPLIT + v;
            }else{
                v = '';// 不输出值，（此时应该是空字符串，而非undefined!，不然跟父节点混淆了）
            }
        }else{
            v = undefined;// 显式的赋值undefined，仅仅是为了标识区别出‘可拓展节点’（含有子属性的父节点）
        }

        let lineArr = [], i;// res[n]
        for(i=1; i<depth; i++){// 左边缩进用的元素
            lineArr.push(i===1?_I1_:_I_);//首元素加入的是_I1_
        }
        lineArr.push(_T_ + escapeString(key).slice(1, -1));// 节点名
        lineArr.push(v);// 节点值

        res.push(lineArr);

        // vertical-space
        for(let vs=0; vs<vSpace; vs++){
            res.push(lineArr.map((item, index) => {
                let isFirst = index===0, //首元素加入的是_I1_
                    isLast = index===(lineArr.length-1),
                    isSpreadableNodeEndFlag = isLast && item===undefined;
                return index<(lineArr.length-1) || isSpreadableNodeEndFlag ? (isFirst?_I1_:_I_) : undefined;
            }));
        }
    }, 'obj');

    fixArr(res);

    // 打印输出
    // let color = require("./cli/colorful");
    // res.forEach(function(item){
    //     let strOut = "[";
    //     item.forEach(function(sub,subIndex){
    //         strOut += ((sub===undefined?color.magenta("undefined"):color.yellow("'"+sub+"'"))  + (subIndex===(item.length-1) ? "" : ", "));
    //     });
    //     strOut += "]";
    //     console.log(strOut);
    // });

    return res.map(item => item.join('').replace(/(\s|\u00A0)+$/, '')).join(msReturnChar ? '\r\n' : '\n');// '\r' just for windows
}

module.exports = treeify;