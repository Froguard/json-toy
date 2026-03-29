import os from 'os';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import colorful from 'color-cc';
import argHelp from './utils/args-help.json';
import { copyTxtToClipboard } from './utils/clipboard';
import dir2Json, { Dir2JsonOptions } from './utils/walk-dir';
import * as Type from '../lib/type-of';
import { treeify } from '../index';

const cwd = process.cwd();
const existsSync = fs.existsSync;
const EOL = os.EOL;
const needMsEol = EOL === '\r\n';

interface Args {
    j?: string | boolean | string[];
    json?: string | boolean | string[];
    d?: string | boolean;
    dir?: string | boolean;
    m?: number | boolean;
    max?: number | boolean;
    c?: boolean;
    copy?: boolean;
    x?: number;
    xspace?: number;
    y?: number;
    yspace?: number;
    outv?: boolean;
    _: (string | number)[];
    [key: string]: unknown;
}

// parse argv
for (const [k, v] of Object.entries(argHelp)) {
    const fn = (yargs as any)[k];
    if (fn) {
        if (Type.isSpreadable(v)) {
            for (const [sk, sv] of Object.entries(v)) {
                fn(sk, sv);
            }
        } else {
            fn(v);
        }
    }
}

const args = yargs.argv as Args;
let argJ = args.j || args.json || (Type.isArray(args._) ? args._[0] : args._);
let argD = args.d || args.dir;
let argM = args.m || args.max;
argM = Type.isBoolean(argM) ? 5 : (parseInt(String(argM)) || 5);
argM = argM < 0 ? 0 : argM;
let needCopy = (args.c === undefined && args.copy === undefined) ? true : !!(args.c || args.copy);
let s = parseInt(String(args.x !== undefined ? args.x : args.xspace));
let v = parseInt(String(args.y !== undefined ? args.y : args.yspace));
let outputVal = args.outv === undefined ? true : !!args.outv;
let jsonName = "";

/* main */
if (argJ) {
    jsonFile2TreeStr();
} else if (argD) {
    dir2TreeStr();
} else {
    help();
}

// tools
function trimAndDelQuotes(str: string): string {
    return !Type.isString(str) ? "" : str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '').replace(/'|"/g, "");
}

function warningOut(str: string): void {
    console.log(colorful.warn(str));
}

function errorOut(str: string): void {
    console.log(colorful.error(str));
}

function help(): void {
    yargs.showHelp();
}

// convert and print and copy a tree-string from a json obj
function _doMain(jsonObj: any, isDir2TreeStr?: boolean): void {
    if (jsonObj !== false) {
        isDir2TreeStr = !!isDir2TreeStr;
        let treeStr: string;
        try {
            treeStr = treeify(jsonObj, {
                jsonName: jsonName,
                space: s,
                vSpace: v,
                needValueOut: outputVal,
                msReturnChar: needMsEol
            });
        } catch (e: any) {
            errorOut(e.toString());
            return;
        }

        if (treeStr) {
            if (!isDir2TreeStr) {
                console.log(treeStr);
            } else {
                // 当显示的是文件目录，将"文件夹"字段变成蓝色显示，这里仅仅是对显示进行转换，而不对源内容转换，因为远内容还要用做复制到剪切板
                const newTreeStr = treeStr;
                const resArr: string[] = [];
                const filterOutStr = " (ignored) /";
                newTreeStr.split("\n").forEach(k => {
                    k = k.replace(/\r/g, "");
                    const mt = k.match(/[└├─]\s([\S]+[\s\S]*\s\/$)/);
                    if (mt && mt[1]) {
                        const ov = mt[1];
                        let nv: string;
                        if (ov.substr(-filterOutStr.length) === filterOutStr) {
                            const foArr = ov.split(filterOutStr);
                            nv = colorful.cyan(foArr[0]) + colorful.gray(filterOutStr);
                        } else {
                            nv = colorful.cyan(ov);
                        }
                        k = k.replace(ov, nv);
                    }
                    resArr.push(k);
                });
                console.log(resArr.join("\n"));
            }

            if (!(Type.isObject as any).isEmptyOwn(jsonObj) && needCopy) {
                // clipboardy.write(treeStr)
                copyTxtToClipboard(treeStr)
                    .then(() => console.log(colorful.success("Copy tree-string success!")));
            }
        }
    }
}

// convert directory to tree-string
function dir2TreeStr(): void {
    argD = Type.isBoolean(argD) ? "./" : trimAndDelQuotes(String(argD));
    let dirJson: any;
    const djOpt: Dir2JsonOptions = {
        exclude: {
            outExcludeDir: true //将过滤掉的文件夹输出
        },
        extChars: {
            directory: " /"
        },
        maxDepth: argM
    };

    try {
        dirJson = dir2Json(argD, djOpt);
    } catch (e: any) {
        errorOut("Gen Json via dir failed: " + e.toString());
        dirJson = false;
    }

    if (!dirJson) {
        if (dirJson === null) {
            warningOut("The directory '" + argD + "' is empty! (exclude-filter: .git|.svn|.idea|node_modules|bower_components )");
        }
    } else if (Type.isString(dirJson)) {
        warningOut("The directory '" + argD + "' is '" + dirJson + "'");
    } else {
        // 间距配置和上面不一样
        s = Type.isNaN(s) ? 2 : s;
        v = Type.isNaN(v) ? 0 : v;
        jsonName = ((djOpt.preChars && djOpt.preChars.directory) || "") + argD.replace(/\\/g, "/");
        outputVal = false;
        _doMain(dirJson, true);
    }
}

// convert *.json file to tree-string
function jsonFile2TreeStr(): void {
    if (Type.isBoolean(argJ)) {
        help();
        return;
    }
    if (argD) {
        warningOut("OK! You'd better not use both -d(--d) and -j(--json) together in one cli. Pick one of them to exec, plz!");
    }

    let targetJson: any;
    const argJson = (Array.isArray(argJ) ? argJ[0] : argJ) || "";

    if (Type.isString(argJson) && argJson.match(/^\{[\S\s:.]+}$/g)) {
        try {
            targetJson = JSON.parse(argJson as any);
        } catch (e1: any) {
            try {
                targetJson = (new Function("return " + argJson + ";"))();
            } catch (e2: any) {
                errorOut(`Parse the input string to json obj failed!:\n${e1.toString()}\n${e2.toString()}`);
                targetJson = false;
            }
        }
    } else {
        const normalizedArgJson = trimAndDelQuotes(String(argJson));
        const filePath = path.normalize(normalizedArgJson);
        if (filePath.match(/(\.json[1-9]?)$/)) {
            jsonName = path.basename(filePath);
            try {
                targetJson = JSON.parse(fs.readFileSync(path.join(cwd, filePath), 'utf8'));
            } catch (e3: any) {
                errorOut(e3.toString());
                targetJson = false;
            }
        } else {
            targetJson = false;
            if (existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                argD = filePath;
                dir2TreeStr();
            } else {
                warningOut(`It looks like that u've typed in an incorrect json-file-path '${filePath}'! it should be 'xx/xxx/*.json', check, plz!`);
            }
        }
    }

    // finally parse
    s = Type.isNaN(s) ? 3 : s;
    v = Type.isNaN(v) ? 1 : v;
    _doMain(targetJson);
} 