let {isArray, isString, isUndefined, isNill, isNaN, isChar, isObject, isSpreadable} = require("./type-of");
let travelJson = require("./json-travel");

/**
 * 缩略字符串
 * @param str
 * @returns {*|string}
 */
function trimRight(str){
    return str.replace(/(\s|\u00A0)+$/,"");
}

/**
 * 将string进行转义输出
 */
// https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
let escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
function escapeString(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    escapable.lastIndex = 0;//复原
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        let c = meta[a];
        return typeof c === 'string' ?
            c :
        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}
// console.log(escapeString("english中文汉字博大精神\n\t\r\"\f\b"));

// 不可用正则中的字符代替，如果需要，请转义
// _TreeChar_中的字符与后面的正则逻辑强相关，请勿更改，请勿有重复的value
let _TreeChar_ = {
    "I":  "│",
    "T":  "├",
    "L":  "└",
    "_":  "─",
    "SPLIT": ":",
    "1":  " ",
    "2":  "  ",
    "3":  "   ",
    "4":  "    ",
    "5":  "     ",
    "6":  "      ",
    "7":  "       ",
    "8":  "        ",
    "9":  "         ",
    "10": "          "
};

// char里面不要包含特殊正则字符，如果有，请转义
function _isStartWith(char){
    let c = "";
    if(isArray(char)){
        c = char.join("|");
    }else{
        c = char || c;
    }
    let reg = new RegExp("^(" + c + ")+");
    return function(str){
        return isString(str) && !!str.match(reg);
    };
}
// 是否为节点：父或者子节点
let isNodeStr = _isStartWith([_TreeChar_.T,_TreeChar_.L,"ROOT"]);

// 检查是否包含连接符号
let _RegTreeLinkChars = new RegExp("^("+[_TreeChar_.I,_TreeChar_.T,_TreeChar_._,_TreeChar_.L].join("|")+")","g");
function _hasTreeLinkChar(str){
    return isString(str) && str.match(_RegTreeLinkChars);
}
// 替换值中包含的连接符号
let _Reg_I_ = new RegExp("^"+_TreeChar_.I,"g"),
    _Reg_T_ = new RegExp("^"+_TreeChar_.T,"g"),
    _Reg_L_ = new RegExp("^"+_TreeChar_.L,"g"),
    _Reg___ = new RegExp("^"+_TreeChar_._,"g");
let _repl_I_ = "'"+_TreeChar_.I+"'",
    _repl_T_ = "'"+_TreeChar_.T+"'",
    _repl_L_ = "'"+_TreeChar_.L+"'",
    _repl___ = "'"+_TreeChar_._+"'";
function replaceTreeLinkChar(str){
    if(!!_hasTreeLinkChar(str)){
        return str.replace(_Reg_I_,_repl_I_)
            .replace(_Reg_T_,_repl_T_)
            .replace(_Reg_L_,_repl_L_)
            .replace(_Reg___,_repl___);
    }
    return str;
}

//通过二维数组检查兄弟节点情况
function checkNextSibling(w,h,arr){
    if(!isArray(arr)){
        throw new TypeError("arr is not a array!");
    }
    let i,hasNextSibling = false;
    for(i=(h+1);i<arr.length;i++){
        if(!isUndefined(arr[i]) && !isArray(arr[i])){
            throw new TypeError("arr is not a two-dimensional-array !");
        }

        let ele = arr[i][w];
        if(undefined===ele){
            break;
        }else if(isNodeStr(ele+"")){
            hasNextSibling = true;
            break;
        }
    }
    return {
        "wPos":w,
        "hPos":i,
        "isLast":!hasNextSibling
    };
}
//修复简单粗暴生成的二位数字，以便生成正确的节点连接符
function fixArr(arr){
    if(!isArray(arr)){
        throw new TypeError("arr is not a array!");
    }
    let regNode = new RegExp("^" + _TreeChar_.T, "g"),
        regVert = new RegExp("^" + _TreeChar_.I ,"g"),
        S = " ";
    let i,iLen = arr.length;
    for(i=0;i<iLen;i++){
        let row = arr[i];
        if(!isArray(row)){
            throw  new TypeError("arr is not a two-dimensional-array !");
        }
        let j,jLen = row.length;
        for(j=0;j<jLen;j++){
            let o = row[j];
            if(undefined!==o && isNodeStr(o)){// 开始检查，且仅检查节点
                let checkNext = checkNextSibling(j,i,arr);
                if(checkNext.isLast){
                    arr[i][j] = o.replace(regNode, _TreeChar_.L);// "├" => "└"
                    let c,cLen = checkNext.hPos;
                    for(c=i+1;c<cLen;c++){
                        if(arr[c]){
                            if(!!arr[c][j] && !!arr[c][j].match(regVert)){
                                arr[c][j] = arr[c][j].replace(regVert,S);// "│" => " "
                            }
                        }
                    }
                }
            }
        }
    }

    // 最后修正根节点: "└" => "", "─" => " "
    let regSimRoot1 = new RegExp(_TreeChar_._,"gi"),
        regSimRoot2 = new RegExp(_TreeChar_.T + "|" +  _TreeChar_.L,"g");
    arr[0][0] = arr[0][0].replace(regSimRoot1," ").replace(regSimRoot2,"");

    return arr;
}
// 重复产生n和char并组成字符串返回
function repeatChar(char,n){
    let res = "";
    char = isChar(char) ? char : "*";
    n = parseInt(n) || 0;
    n = n > 0 ? n : 0;
    if(n>0) while(n--) res += char;
    return res;
}



/**
 * 将json对象转换成树状形式的字符串
 *   view process with 'example/img/flow.png'
 * @param {Object} json
 * @param  {Object} options
 *         {String} options.rootName
 *    {char|Number} options.space  [1,8]
 *         {Number} options.vSpace [0,2]
 *        {Boolean} options.valueOut
 *        {Boolean} options.msRetrunChar '\r'
 * @returns {string} a tree-like string
 */
function treeString(json,options){

    // config
    options =  options || {};
    let jsonName,space,vSpace,needValueOut, msRetrunChar;//不做空值保护，后面挨个做
    jsonName = options.rootName;
    space = options.space;
    vSpace = options.vSpace;
    needValueOut = options.valueOut;
    msRetrunChar = options.msRetrunChar || false;

    // 根节点名称
    jsonName = (isString(jsonName) ? jsonName : 0) || "ROOT";
    if(isNill(json)){
        return jsonName + "'s content is " + String(json);
    }else if(isObject.isEmptyOwn(json)){
        return jsonName + "'s content is empty!";
    }else if(!isSpreadable(json)){
        return jsonName + "'s content is " + (isString(json) ? (escapeString(json)||String(json)) : String(json)) || "empty!";
    }
    // 间距
    let _SPACE_ = space;
    if("\t"!==space){
        space = parseInt(space);
        space = isNaN(space) ? 3 : space;
        space = space <= 0 ? 1 : space > 8 ? 8 : space;//1 <= space <= 8
        _SPACE_ = _TreeChar_[space];
    }else{
        _SPACE_ = "" + (space || " ");
        space = 1;
    }
    vSpace = parseInt(vSpace);
    vSpace = isNaN(vSpace) ? (space > 5 ? 2 : 1) : vSpace;
    vSpace = vSpace< 0 ? 0 : vSpace > 2 ? 2 : vSpace;//0 <= vSpace <= 2
    // 是否需要输出值
    needValueOut = isNill(needValueOut) ? true : !!needValueOut;

    let rpN = parseInt((space-1)/2);//为了美观一点，控制节点间距 1->0 2->0 3->1 4->1 5->2 6->2 7->3 8->3
    let _I_ = _TreeChar_.I + _SPACE_,//连接符
        _T_ = _TreeChar_.T + repeatChar(_TreeChar_._,rpN) + " ",//叶节点
        SPLIT = _TreeChar_.SPLIT + " ";//尾叶节点
    let ft = (Math.floor(jsonName.length/2))  % 10;// 左间距 max 10
    let _rT_ = _TreeChar_.T + " ";//求取根节点的符号
    let _I1_ = _TreeChar_.I + repeatChar(" ",ft-1);// 最左边的符号和间距

    //res:用于存储节点信息的二维数组,末尾显式加上值undefined来区分是否为父节点
    let res = [
        [_rT_ + jsonName, undefined]//加上 _T_ 开头是为了表明这是一个节点，为了fixArr做准备
    ];
    if(vSpace>0){
        let q;
        for(q=0;q<vSpace;q++){
            res.push([_I1_ , _I_]); //此行元素用以增加根节点之下的连字符的竖直距离
        }
    }

    // travel
    travelJson(json,function(key,value,curKeyPath,typeStr,isSpreadable,curDepth){
        let depth = curDepth;
        let v;
        if(!isSpreadable){
            if(needValueOut){
                if(typeStr==="string"){
                    // 如果v值中就包含了特殊连接符号，需要转换一下
                    v = replaceTreeLinkChar(value);//v = value; //其实不转也行的
                    v = escapeString(v) || String(v);
                }else if(typeStr==="array"){//空数组
                    v = "[]";
                }else if(typeStr==="object"){//空对象
                    v = "{}";
                }else if(typeStr==="function"){
                    v = "[function code]";
                }else{
                    v = String(value);
                }
                // 只有叶子节点才放值，父节点放undefined,采用显式赋值undefined作为父节点的标识（显式加入undefined元素可以占一个位置，会增加数组的length）
                v = SPLIT + v;
            }else{
                // 不输出值，（此时应该是空字符串，而非undefined!，不然跟父节点混淆了）
                v = "";
            }
        }else{
            // 显式的赋值undefined，仅仅是为了标识区别出‘可拓展节点’（含有子属性的父节点）
            v = undefined;
        }
        // 一横行：res[n]
        let lineArr = [],i;
        for(i=1;i<depth;i++){// 左边缩进用的元素
            lineArr.push(i===1?_I1_:_I_);//首元素加入的是_I1_
        }
        lineArr.push(_T_ + escapeString(key).slice(1,-1));// 节点名
        lineArr.push(v);// 节点值

        // 保存行信息
        res.push(lineArr);

        // 竖直方向上的间距
        let vs;
        for(vs=0;vs<vSpace;vs++){
            // 增加一行竖直方向上的距离
            res.push(lineArr.map(function(item,index){
                let isFirst = index===0,//首元素加入的是_I1_
                    isLast = index===(lineArr.length-1),
                    isSpreadableNodeEndFlag = isLast && item===undefined;
                return index<(lineArr.length-1) || isSpreadableNodeEndFlag ? (isFirst?_I1_:_I_) : undefined;
            }));
        }

    },"obj");

    // 修正节点连接符
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

    return res.map(function(item){
        return trimRight(item.join(""));//item.join("");
    }).join(msRetrunChar ?"\r\n":"\n");// '\r' just for windows
    // 可以考虑在完全生成之后，做replace替换那几个特殊字符，以便完成自定义连接符
}

// exports
module.exports = treeString;