#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const cwd = process.cwd();
const colorful = require('../lib/cli/colorful');
function warningOut(str){
    console.log(colorful.warn(str));
}

// jts --dir=./ --max=1 --copy=0
let i = 2;
let d,m,c,x,o,jtls;
// default
const vd = "--dir=./";  // current directory
const vm = "--max=1";   // 1 max depth
const vc = "--copy=0";  // needn't copy
const vx = "--xspace=3";// 3 xSpace
// force reset (default)
const vov = '--outv=0';
const isjtls = '--jtls=1';

let argArr = [];

// check if has set
while(process.argv[i]!=undefined){
    let argI = "" + process.argv[i];
    // 首参，且非-?或--?=的形式
    if((i===2 && !argI.match(/^(-{1,2})([a-z]+)=?/)) || (~argI.indexOf('-d') || ~argI.indexOf('--dir'))){
        if(argI.match(/^\{[\w+:\S]+}$/g)){//check json string
            warningOut(`U'd better use 'jts' instead of 'jtls' to parse a json-string. (It wouldn't work in 'jtls' any more!)`);
            process.argv[i] = vd;// overwrite
        }
        d = 1;
    }else if(~argI.indexOf('-m') || ~argI.indexOf('--max')){
        warningOut(`U'd better use 'jts' instead of 'jtls' to set -m or--max. (It wouldn't work in 'jtls' any more!)`);
        process.argv[i] = vm;
        m = 1;
    }else if(~argI.indexOf('--outv')){
        warningOut(`U'd better use 'jts' instead of 'jtls' to set --outv. (It wouldn't work in 'jtls' any more!)`);
        process.argv[i] = vov;
        o = 1;
    }else if(~argI.indexOf('--jtls')){
        process.argv[i] = isjtls;
        jtls = 1;
    }else if(~argI.indexOf('-c') || ~argI.indexOf('--copy')){
        c = 1;
    }else if(~argI.indexOf('-x') || ~argI.indexOf('--xspace')){
        x = 1;
    }
    argArr.push(process.argv[i]);
    i++;
}

// set opts (if never set before since)
!d && argArr.push(process.argv[i] = vd);
!m && argArr.push(process.argv[++i] = vm);
!c && argArr.push(process.argv[++i] = vc);
!x && argArr.push(process.argv[++i] = vx);
!o && argArr.push(process.argv[++i] = vov);
!jtls && argArr.push(process.argv[++i] = isjtls);//此参数专门用以在main.js中去区分是不是jtls指令

// check command
// console.log(`jts ${argArr.join(" ")}`);

// main
require('./main');
