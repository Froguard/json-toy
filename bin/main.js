'use strict';
let os = require('os'),
    parseArgv = require('minimist'),
    version = require('../package.json').version,
    jsonToy = require('../index'),
    dir2Json = require('../lib/cli/walk-dir'),
    fs = require('fs'),
    path = require('path'),
    cwd = process.cwd(),
    Type = require('../lib/typeOf'),
    clipboardy = require('clipboardy'),
    colorful = require('../lib/cli/colorful'),
    existsSync = fs.existsSync || path.existsSync;

let EOL = os.EOL;
let needMsEol = EOL === '\r\n';

// parse argv
// let args = parseArgv(process.argv.slice(2));
let yargs = require('yargs').usage('Usage:  jts [options]')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .option('j', {
        alias: 'json',
        describe: 'Necessary! Accept 3 type:\n' +
        '1.A file path of target XXX.json file\n' +
        '2.A directory path to travel\n' +
        '3.A json string to convert(need \'\'or "" warpped)'
    })
    .option('c', {
        alias: 'copy',
        describe: 'copy to clipboard, set 0 to close',
        default: 1,
        choices: [0, 1]
    })
    .option('x', {
        alias: 'xspace',
        describe: 'tree horizon-space',
        default: 2
    })
    .option('y', {
        alias: 'yspace',
        describe: 'tree vertical-space',
        default: 0
    })
    .option('d', {
        alias: 'dir',
        describe: 'convert a directory to a tree string'
    })
    .option('m', {
        alias: 'max',
        type: 'number',
        describe: 'set max depth during converting a directory to a tree string',
        default: 5
    })
    .example('jts ./package.json', 'treeify a json file (a path with tail \'.json\' )')
    .example('jts ./ --copy=0', 'treeify current directory')
    .example('jts \'{a:1,b:{c:2},d:3}\'', 'treeify a json string (need \'\'or "" warpped)')
    .example('jtls', 'short for \'jts ./ --copy=0\'')
    .epilog('About more: https://github.com/Froguard/json-toy\n');
const args = yargs.argv;

// main argv
let argJ = args.j || args.json || (Type.isArray(args._) ? args._[0] : args._);
let argD = args.d || args.dir;
let argM = args.m || args.max;
argM = Type.isBoolean(argM) ? 5 : (parseInt(argM) || 5);
argM = argM < 0 ? 0 : argM;
let needCopy = (undefined===args.c && undefined===args.copy) ? 1 : !!(args.c || args.copy);
let s = parseInt(args.x !== undefined ? args.x : args.xspace),
    v = parseInt(args.y !== undefined ? args.y : args.yspace);
let outputVal = undefined===args.outv ? true : !!args.outv;
let jsonName = "";

/* main */
if(args.v || args.V || args.version){
    console.log(version);

}else if(argJ){
    jsonFile2TreeStr()

}else if(argD){
    dir2TreeStr();

}else{
    help();

}

// tools
function trimAndDelQuotes(str){
    return !Type.isString(str) ? "" : str.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'').replace(/'|"/g,"");
}
function warningOut(str){
    console.log(colorful.warn(str));
}
function errorOut(str){
    console.log(colorful.error(str));
}
function help(){
    yargs.showHelp();
}

// convert and print and copy a tree-string from a json obj
function _doMain(jsonObj,isDir2TreeStr){
    if(false!==jsonObj){
        isDir2TreeStr = !!isDir2TreeStr;
        let treeStr;
        try{
            // console.time(colorful.green("\nConvert takes"));
            treeStr = jsonToy.treeString(jsonObj,{
                rootName: jsonName,
                space: s,
                vSpace: v,
                valueOut: outputVal,
                msReturnChar: needMsEol
            });
            // console.timeEnd(colorful.green("\nConvert takes"));
        }catch(e2){
            errorOut(e2.toString());
        }
        if(!!treeStr){
            if(!isDir2TreeStr){
                console.log(treeStr);
            }else{
                // 当显示的是文件目录，将"文件夹"字段变成蓝色显示，这里仅仅是对显示进行转换，而不对源内容转换，因为远内容还要用做复制到剪切板
                let newTreeStr = "" + treeStr;
                let resArr = [];
                let filterOutStr = " (ignored) /";
                newTreeStr.split("\n").forEach(k=>{
                    k = k.replace(/\r/g,"");
                    let mt = k.match(/[└├─]\s([\S]+[\s\S]*\s\/$)/);
                    if(mt && mt[1]){
                        let ov = mt[1],nv;
                        if(ov.substr(-filterOutStr.length) === filterOutStr){
                          let foArr = ov.split(filterOutStr);
                          nv = colorful.cyan(foArr[0]) + colorful.gray(filterOutStr);
                        }else{
                            nv = colorful.cyan(ov);
                        }
                        k = k.replace(ov,nv);
                    }
                    resArr.push(k);
                });
                console.log(resArr.join("\n"));
            }
            if(!Type.isObject.isEmptyOwn(jsonObj) && needCopy){
                clipboardy.write(treeStr)
                    .then(()=>console.log(colorful.success("Copy tree-string success!")));
            }
        }
    }
}

// convert directory to tree-string
function dir2TreeStr(){
    argD = Type.isBoolean(argD) ? "./" : trimAndDelQuotes(argD);
    let dirJson,djOpt;
    try{
        djOpt = {
            // preChars:{
            //     directory: ":open_file_folder: ",
            //     file:":page_facing_up: "
            // },
            exclude:{
                outExcludeDir: true //将过滤掉的文件夹输出
            },
            extChars:{
                directory: " /"
            },
            maxDepth: argM
        };
        dirJson = dir2Json(argD, djOpt);
    }catch(e3){
        errorOut("Gen Json via dir failed: " + e3.toString());
        dirJson = false;
    }
    if(!dirJson){
        if(dirJson===null){
            warningOut("The directory '" + argD + "' is empty! (exclude-filter: .git|.svn|.idea|node_modules|bower_components )");
        }
    }else if(Type.isString(dirJson)){
        warningOut("The directory '" + argD + "' is '" + dirJson + "'");
    }else{
        // 间距配置和上面不一样
        s = Type.isNaN(s) ? 2 : s;
        v = Type.isNaN(v) ? 0 : v;
        jsonName = (djOpt.preChars && djOpt.preChars.directory || "") + argD.replace(/\\/g,"/");
        outputVal = false;
        _doMain(dirJson,true);
    }
}

// convert *.json file to tree-string
function jsonFile2TreeStr(){
    if(Type.isBoolean(argJ)){
        help();
        return;
    }
    if(argD){
        warningOut("OK! You'd better not use both -d(--d) and -j(--json) together in one cli. Pick one of them to exec, plz!");
    }
    let targetJson;
    let argJson = (Array.isArray(argJ) ? argJ[0] : argJ) || "";
    if(argJson.match(/^\{[\S\s:.]+}$/g)){// 简单判断一下输入的是否是json格式的字符串
        try{
            targetJson = JSON.parse(argJson);
        }catch (e1){
            try{
                targetJson = (new Function("return "+argJson+";"))();
            }catch(e2){
                errorOut(`Parse the input string to json obj failed!:\n${e1.toString()}\n${e2.toString()}`);
                targetJson = false;
            }
        }
    }else{
        argJson = trimAndDelQuotes(argJson);
        let filePath = path.normalize(argJson);
        if(filePath.match(/(\.json[1-9]?)$/)){// 文件：*.json || *.json(1~9)
            jsonName = path.basename(filePath);
            try{
                targetJson = JSON.parse(fs.readFileSync(path.join(cwd, filePath), 'utf8'));
            }catch (e3){
                errorOut(e3.toString());
                targetJson = false;
            }
        }else{
            targetJson = false;
            if(existsSync(filePath) && fs.statSync(filePath).isDirectory()){// 如果路径存在，且是一个文件夹，则进行遍历文件夹
                argD = filePath;
                dir2TreeStr();
            }else{
                warningOut(`It looks like that u've typed in an incorrect json-file-path '${filePath}'! it should be 'xx/xxx/*.json', check, plz!`)
            }
        }
    }
    // finally parse
    s = Type.isNaN(s) ? 3 : s;
    v = Type.isNaN(v) ? 1 : v;
    _doMain(targetJson);
}