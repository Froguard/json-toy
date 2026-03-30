module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 180,
  useTabs: false,
  jsxSingleQuote: false,
  bracketSpacing: true,
  htmlWhitespaceSensitivity: "css",
  endOfLine: "lf",
  trailingComma: "all",
  arrowParens: "avoid",
  overrides: [
    {
      files: ".prettierrc",
      options: {
        parser: "json"
      }
    }
  ]
}
