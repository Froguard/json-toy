/**
 * 1. 使用 eslint 而非 tslint，因为 tslint 已经废弃不更新，其官方也推荐 eslint
 * 2. prettier 和 eslint 有一定交叉的地方，但不妨碍同时使用，主要目的是各司其职
 *    - eslint：语法检查
 *    - prettier：代码美化
 * 3. 推荐在 .vscode/settings.json 配置文件中，添加 autoFix 能力
 */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'    
  ],
  // 需要覆盖上面配置中 rule 的规则
  rules: {
    // ts
    '@typescript-eslint/ban-types': ['warn'],
    '@typescript-eslint/no-empty-function': ['warn'], // 空函数警告下
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-var-requires': ['warn'],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    // 
    'import/order': ['warn', {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"]
    }],
    'import/no-named-as-default': ['off'],
    'no-var': 'error',
    'max-len': ['error', { code: 180 }],
    'max-statements': ['error', 100, { ignoreTopLevelFunctions: true }],
    'max-params': 'off',
    'max-lines': ['error', { max: 999, skipBlankLines: true, skipComments: true }],
    'complexity': ['error', { max: 100 }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-var-require': ['off', false],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^__' }],
    '@typescript-eslint/ban-ts-comment': 0,
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "no-trailing-spaces": "error",
    //...
  },
  globals: {
    // Nodejs
    process: true,
    define: true,
    require: true,
    module: true,
    Module: true,
    globalThis: true,
    // test-case
    describe: true, // 测试用例所需对象
    it: true, // 测试用例所需对象
    // ES6+
    Promise: true,
    DEBUG: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true
      },
      node: true,
    },
    // "import/core-modules": ["undici"]
  },
  env: {
    node: true
  }
}