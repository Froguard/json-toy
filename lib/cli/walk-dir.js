var path = require('path');
var fs = require('fs');
var Type = require('../typeOf');//这里不适用node-util检查，因为官方提示很多isXXX方法会过时
var fileExistSync = fs.existsSync || path.existsSync;
var colorful = require('./colorful');

var REGEXP_IGNORE_DIR = /(\.git|\.svn|\.idea|node_modules|bower_components)/g;
var REGEXP_IGNORE_FILE = /(Thumbs\.db|\.DS_store)/g;

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
    var statRootPath = fs.statSync(rootPath);
    if(!statRootPath.isDirectory()){
        return "not a directory";
    }

    // options
    options = options || {};
    var exclude = options.exclude;
    var extChars = options.extChars;
    var preChars = options.preChars;
    var maxDepth = parseInt(options.maxDepth);
    maxDepth = maxDepth || 0;
    if(!maxDepth || maxDepth>5){
        // “潜在的长时等待”提示
        console.log(colorful.warn("Potential long-time-wait: You`d better set a max depth (letter than 5) to access directories,or it will spend a long time!"));
    }
    // options.exclude: 排除某些文件或文件夹
    if(Type.isNullOrUndefined(exclude)){
        exclude = {
            // all:/pom\.xml/g,
            file: REGEXP_IGNORE_FILE,
            directory: REGEXP_IGNORE_DIR,
            outExcludeDir: false //是否将exclude的dir进行输出
        }
    }else{
        exclude = Type.isObject(exclude) ? (exclude||{}) : {};
        exclude.file =  exclude.file || REGEXP_IGNORE_FILE;
        exclude.directory = exclude.directory || REGEXP_IGNORE_DIR;
        exclude.outExcludeDir = exclude.outExcludeDir || false;
    }
    var filterGlobal = exclude.all || false;
    var filterFile = exclude.file || false;
    var filterDir = exclude.directory || false;
    var outExcludeDir = exclude.outExcludeDir;
    filterGlobal = Type.isRegExp(filterGlobal) ? filterGlobal : Type.isString(filterGlobal) ? new RegExp(filterGlobal,"g") : false;
    filterFile = Type.isRegExp(filterFile) ? filterFile : Type.isString(filterFile) ? new RegExp(filterFile,"g") : false;
    filterDir = Type.isRegExp(filterDir) ? filterDir : Type.isString(filterDir) ? new RegExp(filterDir,"g") : false;
    // options.extChars：文件或文件夹后面的符号，比如一般文件夹后面的符号是'/'
    if(Type.isNullOrUndefined(extChars)){
        extChars = { file: "", directory: "" };
    }else{
        extChars = extChars || {};
        extChars.file = Type.isString(extChars.file) ? extChars.file : "";
        extChars.directory = Type.isString(extChars.directory) ? extChars.directory : "";
    }
    // options.preChars：文件或文件夹后面的符号，比如一般文件夹后面的符号是'/'
    if(Type.isNullOrUndefined(preChars)){
        preChars = { file: "", directory: "" };
    }else{
        preChars = preChars || {};
        preChars.file = Type.isString(preChars.file) ? preChars.file : "";
        preChars.directory = Type.isString(preChars.directory) ? preChars.directory : "";
    }
    var fPre = preChars.file;
    var dPre = preChars.directory;
    var fExt = extChars.file;
    var dExt = extChars.directory;

    // result json
    var json = {};

    // do main
    function travel(pathArg,far,curDepth){
        if(!maxDepth || (maxDepth && curDepth<=maxDepth)){
            var dirs;
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
                dirs.forEach(function (item) {
                    var curPath = path.join(pathArg,item);
                    var stat;// 获取fsStatInfo，用以后面的判断
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
                            var dPropName;
                            if(!filterDir || (!!filterDir && !item.match(filterDir)) ){
                                dPropName = dPre + item + dExt;
                                far[dPropName] = {};
                                travel(curPath, far[dPropName],curDepth+1);
                            }else{
                                if(!!filterDir && item.match(filterDir) && outExcludeDir){
                                    dPropName = dPre + item + " (filter-out)" + dExt;
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
    return {}===json ? null : json;
}

module.exports = dir2Json;