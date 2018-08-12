/**
 * 仿照 colors的api，借助ansi字符，做一个带有颜色的输出
 * 对于不支持颜色的控制台来说，可能会输出一些奇怪的ansi字符
 * 线上则统一取消颜色输出
 */
let util = require('util');
// 原样输出
function noop(){
    return util.format.apply(util,arguments);
}
// console.log(noop(1,2,3,4,5,6,[1,2,3],{x:1}));

function isNotNaN(o){
    return o===o;
}
function isCorrectCode(o){
    return o!==null && o!==undefined && isNotNaN(o);
}
let c2Ansi = {
    style: {
        normal: 0,
        bold: 1,
        underline: 4,
        blink: 5,
        strike: 9
    },
    fore: {
        black: 30,
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37,
        gray: 90,
        grey: 90,
        brightBlack: 90,
        brightRed: 91,
        brightGreen: 92,
        brightYellow: 99,
        brightBlue: 94,
        brightMagenta: 95,
        brightCyan: 96,
        brightWhite: 97
    },
    back: {
        black: 40,
        red: 41,
        green: 42,
        yellow: 43,
        blue: 44,
        magenta: 45,
        cyan: 46,
        white: 47,
        gray:100,
        grey:100,
        brightBlack: 100,
        brightRed: 101,
        brightGreen: 102,
        brightYellow: 103,
        brightBlue: 104,
        brightMagenta: 105,
        brightCyan: 106,
        brightWhite: 107
    }
};
function colorify(text, fore, back, style) {
    if(global && global.document && global.document.nodeType === 9) return text;
    if(!fore) return text;
    let attrCode, backCode, foreCode, octpfx, reset, result, suffix, _ref;
    if (style == null) {
        style = "normal";
    }
    if (typeof fore !== "string") {
        _ref = fore;
        fore = _ref.fore;
        back = _ref.back;
        style = _ref.style;
    }
    result = [];
    foreCode = c2Ansi.fore[fore] || parseInt(fore);
    isCorrectCode(foreCode) && result.push(foreCode);

    backCode = c2Ansi.back[back] || parseInt(back);
    isCorrectCode(backCode) && result.push(backCode);

    attrCode = c2Ansi.style[style] || parseInt(style);
    isCorrectCode(attrCode) && result.push(attrCode);

    suffix = result.join(";");
    octpfx = "\033";
    reset = "" + octpfx + "[0m";
    // let outStr = "" + octpfx + "[" + suffix + "m" + text + reset;
    // console.log(JSON.stringify(outStr));
    return "" + octpfx + "[" + suffix + "m" + text + reset;
}

let arrF = ["black","white","blue","red","green","yellow","cyan","magenta","gray","grey",
            "brightBlack","brightRed","brightGreen","brightYellow","brightBlue","brightMagenta","brightCyan","brightWhite"//特有
           ];
let arrB = ["bgBlack","bgRed","bgGreen","bgYellow","bgBlue","bgMagenta","bgCyan","bgWhite",
            "bgBrightBlack","bgBrightRed","bgBrightGreen","bgBrightYellow","bgBrightBlue","bgBrightMagenta","bgBrightCyan","bgBrightWhite"//特有
           ];
let arrS = ["normal","bold","underline","blink","strike",
            "reset","dim","italic","inverse","hidden","strikethrough"//这排只是兼容colors处理，其实废弃无用
           ];
function genFn(mainProp,bgProp,subProp){
    let empty = false;
    if(!mainProp && !bgProp && !subProp){
        empty = true;
    }
    return function(){
        let aLen = arguments.length;
        if(aLen<=1){
            let str = aLen ? arguments[0] : "";
            return empty ? str : colorify(str,mainProp,bgProp,subProp);
        }else{
            let result = "";
            let i;
            for(i=0;i<aLen;i++){
                let out = (typeof arguments[i] !== "object" ? arguments[i] : JSON.stringify(arguments[i]));
                result += (i===0?"":" ") + (empty ? out : colorify(out,mainProp,bgProp,subProp));
            }
            return result;
        }
    };
}

/**
 * expose
 * @param needColor 是否需要颜色
 * @returns {Object}
 * 用法： let colors = config(1);
 * colors.fore.bg.style(text)  fore,bg，style可以缺省，但是前后顺序不能乱 fore > bg > style
 * eg:    colors.bgYellow.bold 可以，
 *    但是 colors.bold.bgYellow不可以，因为顺序不对
 */
function config(needColor){
    let colorsTool = {};//这里为一个局部变量，为了方便多次初始化，每次执行都返回一个新的对象
    let isProdEnv = process.env.NODE_ENV==="production";
    //参数缺省时，非production环境变量，都需要带上颜色
    needColor = needColor===undefined ? !isProdEnv : !!needColor;

    let f,b,s;
    let len1 = arrF.length;
    let len2 = arrB.length;
    let len3 = arrS.length;
    // colors.red
    for(f=0;f<len1;f++){
        colorsTool[arrF[f]] = needColor ? genFn(arrF[f],null,null) : noop;
        // colors.red.bgYellow
        let i1;
        for(i1=0;i1<len2;i1++){
            let bName = arrB[i1].split("bg")[1];
            bName = bName.substring(0,1).toLowerCase() + bName.substr(1);// 仅首字母转成小写
            colorsTool[arrF[f]][arrB[i1]] = needColor ? genFn(arrF[f],bName,null) : noop;
            // colors.red.bgYellow.bold
            let j1;
            for(j1=0;j1<len3;j1++){
                colorsTool[arrF[f]][arrB[i1]][arrS[j1]] = needColor ? genFn(arrF[f],bName,arrS[j1]) : noop;
            }
        }
        // colors.red.bold
        let k1;
        for(k1=0;k1<len3;k1++){
            colorsTool[arrF[f]][arrS[k1]] = needColor ? genFn(arrF[f],null,arrS[k1]) : noop;
        }
    }
    // colors.bgYellow
    for(b=0;b<len2;b++){
        let bName2 = arrB[b].split("bg")[1].toLowerCase();
        colorsTool[arrB[b]] = needColor ? genFn(null,bName2,null) : noop;
        // colors.bgYellow.bold
        let i2;
        for(i2=0;i2<len3;i2++){
            colorsTool[arrB[b]][arrS[i2]] = needColor ? genFn(null,bName2,arrS[i2]) : noop;
        }
    }
    // colors.bold
    for(s=0;s<len3;s++){
        colorsTool[arrS[s]] = needColor ? genFn(null,null,arrS[s]) : noop;
    }

    // 常规组合：warn error success fail
    colorsTool.warn = function(str){
        if(typeof str !=="string"){ return str; }
        str = str.replace("\r","");
        return colorsTool.red.bgYellow("[warning]") + " " + colorsTool.yellow(str.split("\n").join("\n          "));
    };
    colorsTool.error = function(str){
        if(typeof str !=="string"){ return str; }
        str = str.replace("\r","");
        return colorsTool.red.bgBrightYellow.bold("[error]") + " " + colorsTool.red.bold(str.split("\n").join("\n        "));
    };
    colorsTool.success = function(str){
        if(typeof str !=="string"){ return str; }
        str = str.replace("\r","");
        return colorsTool.green.bold(str);
    };
    colorsTool.fail = function(str){
        if(typeof str !=="string"){ return str; }
        str = str.replace("\r","");
        return colorsTool.gray.bold(str);
    };

    return colorsTool;
}

//
module.exports = config(1);
module.exports.create = config;

