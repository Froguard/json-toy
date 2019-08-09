module.exports = {
    "parser": "babel-eslint",
    "globals": {
        "require": true
    },
    "extends": [
        "kaola/esnext"
    ],
    "parserOptions": {
        "ecmaVersion": 6
    },
    "rules": {
        "max-depth": 1
    }
};