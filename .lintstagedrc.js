module.exports = {
    "*.{ts,md,json}": [
    // prettier 风格美化
    "prettier --write",
    "echo 'prettier 格式化'"
  ],
  "*.{ts,json}": [
    // eslint 修复
    "eslint --fix",
    "echo 'eslint 修复'"
  ]
}