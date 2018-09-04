let path = require('path');
let fs = require('fs');
let {isNill, isObject, isRegExp, isString} = require('../type-of');//这里不适用node-util检查，因为官方提示很多isXXX方法会过时
let fileExistSync = fs.existsSync;// || path.existsSync;//node@0.8.0
let colorful = require('./colorful');

let REGEXP_IGNORE_DIR = /(\.git|\.svn|\.idea|node_modules|bower_components)/g;
let REGEXP_IGNORE_FILE = /(Thumbs\.db|\.DS_store)/g;

/**
 * 将文件目录转换为json对象
 * @param {String} rootPath 目标根目录
 * @param {Object} options
 *        {Object} options.exclude
 *        {RegExp} options.exclude.all,file,directory 正则表达式去匹配 “排除项”
 *        {Object} options.extChars
 *        {String} options.extChars.file,directory 文件节点，文件夹节点的末尾字符
 * @returns {JSON|String}
 */
function dir2Json(rootPath,options) {
    // root
    rootPath = path.normalize(rootPath) || "./";
    if(!fileExistSync(rootPath)){
        throw new Error("The path '"+rootPath+"' is not existed!");
    }
    let statRootPath = fs.statSync(rootPath);
    if(!statRootPath.isDirectory()){
        return "not a directory";
    }

    // options
    options = options || {};
    let exclude = options.exclude;
    let extChars = options.extChars;
    let preChars = options.preChars;
    let maxDepth = parseInt(options.maxDepth);
    maxDepth = maxDepth || 0;
    if(!maxDepth || maxDepth>5){
        // “潜在的长时等待”提示
        console.log(colorful.warn("Potential long-time-wait: You`d better set a max depth (letter than 5) to access directories,or it will spend a long time!"));
    }
    // options.exclude: 排除某些文件或文件夹
    if(isNill(exclude)){
        exclude = {
            // all:/pom\.xml/g,
            file: REGEXP_IGNORE_FILE,
            directory: REGEXP_IGNORE_DIR,
            outExcludeDir: false //是否将exclude的dir进行输出
        }
    }else{
        exclude = isObject(exclude) ? exclude : {};
        exclude.file =  exclude.file || REGEXP_IGNORE_FILE;
        exclude.directory = exclude.directory || REGEXP_IGNORE_DIR;
        exclude.outExcludeDir = exclude.outExcludeDir || false;
    }
    let filterGlobal = exclude.all || false;
    let filterFile = exclude.file;
    let filterDir = exclude.directory;
    let outExcludeDir = exclude.outExcludeDir;
    filterGlobal = isRegExp(filterGlobal) ? filterGlobal : isString(filterGlobal) ? new RegExp(filterGlobal,"g") : false;
    filterFile = isRegExp(filterFile) ? filterFile : isString(filterFile) ? new RegExp(filterFile,"g") : false;
    filterDir = isRegExp(filterDir) ? filterDir : isString(filterDir) ? new RegExp(filterDir,"g") : false;
    // options.extChars：文件或文件夹后面的符号，比如一般文件夹后面的符号是'/'
    if(isNill(extChars)){
        extChars = { file: "", directory: "" };
    }else{
        extChars = extChars || {};
        extChars.file = isString(extChars.file) ? extChars.file : "";
        extChars.directory = isString(extChars.directory) ? extChars.directory : "";
    }
    // options.preChars：文件或文件夹后面的符号，比如一般文件夹后面的符号是'/'
    if(isNill(preChars)){
        preChars = { file: "", directory: "" };
    }else{
        preChars = preChars || {};
        preChars.file = isString(preChars.file) ? preChars.file : "";
        preChars.directory = isString(preChars.directory) ? preChars.directory : "";
    }
    let fPre = preChars.file;
    let dPre = preChars.directory;
    let fExt = extChars.file;
    let dExt = extChars.directory;

    // result json
    let json = {};

    // do main
    function travel(pathArg,far,curDepth){
        if(!maxDepth || (maxDepth && curDepth<=maxDepth)){
            let dirs;
            try{
                // todo 目录太多时候崩溃未考虑
                dirs = fs.readdirSync(pathArg);//第一级子目录（文件|文件夹）
            }catch(e){
                console.log(colorful.error(`Occur error with read dirs from '${pathArg}',${e.toString()}`));
                dirs = false;
            }
            if(dirs && dirs.length){
                if(dirs.length>=30){
                    console.log(colorful.warn("Too many files|directories was found, type-in an exact target to simplify or reduce result.")
                        + "\n          "+colorful.yellow("path: ") + colorful.cyan("'"+pathArg.replace(/\\/g,"/")+"'"));
                }
                // todo 子项太多未考虑
                dirs.forEach(function (item) {
                    let curPath = path.join(pathArg,item);
                    let stat;// 获取fsStatInfo，用以后面的判断
                    try{
                        // todo 读大文件时候情况未考虑
                        stat = fs.statSync(curPath);// 读取文件信息
                    }catch(e1){
                        console.log(colorful.warn(`Skip to read stat info from '${curPath}'\n${e1.toString()}`));
                        stat = false;
                    }
                    // 通配检查
                    if(!filterGlobal || (!!filterGlobal && !item.match(filterGlobal)) ){
                        // 文件夹类型的值为“其对应的实际对象”，文件类型值为"file",
                        // 读取stat失败的类型对应值为"unreadableStatType",其他的为"unknownStatType"
                        if(!stat){
                            far[item] = "unreadableStatType";
                            return false;
                        }
                        if(stat.isFile()){//文件
                            if(!filterFile || (!!filterFile && !item.match(filterFile)) ){
                                far[fPre + item + fExt] = "file";
                            }
                        }else if(stat.isDirectory()){//文件夹
                            let dPropName;
                            if(!filterDir || (!!filterDir && !item.match(filterDir)) ){
                                dPropName = dPre + item + dExt;
                                far[dPropName] = {};
                                travel(curPath, far[dPropName],curDepth+1);
                            }else{
                                if(!!filterDir && item.match(filterDir) && outExcludeDir){
                                    dPropName = dPre + item + " (ignored)" + dExt;
                                    far[dPropName] = {};
                                }
                            }
                        }else{
                            // console.log("非文件也非目录：",item);//比如文件夹快捷方式，文件快捷方式 unix之下的另外的东西，管道，套接字等等
                            // 这里不读超链接的原因是，避免有可能出现的死循环
                            far[item] = "unknownStatType";
                        }
                    }
                });
            }
        }
    }
    travel(rootPath,json,1);
    return isObject.isEmptyOwn(json) ? null : json;
}

module.exports = dir2Json;