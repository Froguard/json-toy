import util from 'util';

interface AnsiCodes {
    style: { [key: string]: number };
    fore: { [key: string]: number };
    back: { [key: string]: number };
}

interface ColorFunction {
    (...args: any[]): string;
    [key: string]: ColorFunction;
}

interface ColorTool {
    [key: string]: ColorFunction;
}

// 原样输出
function noop(...args: any[]): string {
    return util.format.apply(util, args);
}

function isNotNaN(o: any): boolean {
    return o === o;
}

function isCorrectCode(o: any): boolean {
    return o !== null && o !== undefined && isNotNaN(o);
}

const c2Ansi: AnsiCodes = {
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
        gray: 100,
        grey: 100,
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

interface ColorifyOptions {
    fore?: string;
    back?: string;
    style?: string;
}

function colorify(text: string, fore?: string | ColorifyOptions, back?: string, style: string = 'normal'): string {
    if (typeof window !== 'undefined' && window.document && window.document.nodeType === 9) return text;
    if (!fore) return text;

    let foreCode: number | undefined;
    let backCode: number | undefined;
    let attrCode: number | undefined;

    if (typeof fore === 'object') {
        const options = fore;
        fore = options.fore || '';
        back = options.back;
        style = options.style || 'normal';
    }

    const result: number[] = [];

    foreCode = c2Ansi.fore[fore as string] || parseInt(fore as string);
    if (isCorrectCode(foreCode)) result.push(foreCode);

    backCode = c2Ansi.back[back || ''] || parseInt(back || '');
    if (isCorrectCode(backCode)) result.push(backCode);

    attrCode = c2Ansi.style[style] || parseInt(style);
    if (isCorrectCode(attrCode)) result.push(attrCode);

    const suffix = result.join(';');
    const octpfx = '\u001b';
    const reset = `${octpfx}[0m`;

    return `${octpfx}[${suffix}m${text}${reset}`;
}

const arrF = [
    'black', 'white', 'blue', 'red', 'green', 'yellow', 'cyan', 'magenta', 'gray', 'grey',
    'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'
];

const arrB = [
    'bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite',
    'bgBrightBlack', 'bgBrightRed', 'bgBrightGreen', 'bgBrightYellow', 'bgBrightBlue', 'bgBrightMagenta', 'bgBrightCyan', 'bgBrightWhite'
];

const arrS = [
    'normal', 'bold', 'underline', 'blink', 'strike',
    'reset', 'dim', 'italic', 'inverse', 'hidden', 'strikethrough'
];

function genFn(mainProp?: string, bgProp?: string, subProp?: string): ColorFunction {
    const empty = !mainProp && !bgProp && !subProp;

    const fn = function(...args: any[]): string {
        const aLen = args.length;
        if (aLen <= 1) {
            const str = aLen ? String(args[0]) : '';
            return empty ? str : colorify(str, mainProp, bgProp, subProp);
        } else {
            let result = '';
            for (let i = 0; i < aLen; i++) {
                const out = (typeof args[i] !== 'object' ? String(args[i]) : JSON.stringify(args[i]));
                result += (i === 0 ? '' : ' ') + (empty ? out : colorify(out, mainProp, bgProp, subProp));
            }
            return result;
        }
    };

    return fn as ColorFunction;
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
function config(needColor?: boolean): ColorTool {
    const colorsTool: ColorTool = {};
    const isProdEnv = process.env.NODE_ENV === 'production';
    needColor = needColor === undefined ? !isProdEnv : !!needColor;

    // colors.red
    for (const f of arrF) {
        colorsTool[f] = needColor ? genFn(f, null, null) : noop;
        // colors.red.bgYellow
        for (const b of arrB) {
            const bName = b.slice(2).charAt(0).toLowerCase() + b.slice(3);
            (colorsTool[f] as any)[b] = needColor ? genFn(f, bName, null) : noop;
            // colors.red.bgYellow.bold
            for (const s of arrS) {
                (colorsTool[f] as any)[b][s] = needColor ? genFn(f, bName, s) : noop;
            }
        }
        // colors.red.bold
        for (const s of arrS) {
            (colorsTool[f] as any)[s] = needColor ? genFn(f, null, s) : noop;
        }
    }

    // colors.bgYellow
    for (const b of arrB) {
        const bName = b.slice(2).toLowerCase();
        colorsTool[b] = needColor ? genFn(null, bName, null) : noop;
        // colors.bgYellow.bold
        for (const s of arrS) {
            (colorsTool[b] as any)[s] = needColor ? genFn(null, bName, s) : noop;
        }
    }

    // colors.bold
    for (const s of arrS) {
        colorsTool[s] = needColor ? genFn(null, null, s) : noop;
    }

    // 常规组合：warn error success fail
    colorsTool.warn = function(str: any): string {
        if (typeof str !== 'string') { return String(str); }
        str = str.replace('\r', '');
        return colorsTool.red.bgYellow('[warning]') + ' ' + colorsTool.yellow(str.split('\n').join('\n          '));
    };

    colorsTool.error = function(str: any): string {
        if (typeof str !== 'string') { return String(str); }
        str = str.replace('\r', '');
        return colorsTool.red.bgBrightYellow.bold('[error]') + ' ' + colorsTool.red.bold(str.split('\n').join('\n        '));
    };

    colorsTool.success = function(str: any): string {
        if (typeof str !== 'string') { return String(str); }
        str = str.replace('\r', '');
        return colorsTool.green.bold(str);
    };

    return colorsTool;
}

export const colorful = config(); 