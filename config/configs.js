module.exports = {
    'index': {
        codeTreeShaking: false,
        outLibrary: 'jsonToy',
        entryPath: './index.js'
    },
    'json-check-circular': {
        codeTreeShaking: true,
        outLibrary: 'jsonCheckCircular',
        entryPath: './lib/json-check-circular.js'
    },
    'json-get-val-by-keypath': {
        codeTreeShaking: true,
        outLibrary: 'jsonGetValByKeypath',
        entryPath: './lib/json-get-val-by-keypath.js'
    },
    'json-treeify': {
        codeTreeShaking: true,
        outLibrary: 'jsonTreeify',
        entryPath: './lib/json-treeify.js'
    },
    'json-travel': {
        codeTreeShaking: true,
        outLibrary: 'jsonTravel',
        entryPath: './lib/json-travel.js'
    },
    'type-of': {
        codeTreeShaking: true,
        outLibrary: 'typeOf',
        entryPath: './lib/type-of'
    }
};