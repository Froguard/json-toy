# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

`json-toy` 是一个 TypeScript 工具库和 CLI，用于将 JSON/对象转换为树形字符串（├└│─），支持安全递归遍历、循环引用检测和 keyPath 取值。目标环境 Node >= 16，同时输出 CJS 和 ESM。

## 常用命令

- **构建全部：** `npm run build`（并行执行 `build:esm`、`build:cjs`、`build:types`）
- **运行测试：** `npm test`
- **运行单个测试：** `jest ./__tests__/lib/xxx.test.ts`
- **测试覆盖率：** `npm run test:cover`
- **Lint 修复：** `npm run lint:fix`
- **本地开发：** `npm run dev` / `npm run dev:bin`

## 代码架构

### 入口
- `src/index.ts` 导出 4 个 API：`travelJson`、`checkCircular`、`getValByKeyPath`、`treeify`。

### 核心库（`src/lib/`）
- **`type-of.ts`** — 类型判断工具。注意 `isObject` 和 `isNumber` 被动态挂载了扩展方法（如 `isEmptyOwn`、`isFlat`、`integer` 等）。
- **`json-travel.ts`** — 安全的递归遍历器，`safeMode` 默认开启，用栈检测循环引用，遇到循环会替换为 `[Circular->keyPath]`。
- **`json-check-circular.ts`** — 基于 `travelJson` 检测循环引用，返回 `{ isCircular, circularProps }`。
- **`json-get-val-by-keypath.ts`** — 通过 `a.b.c.1.2` 形式的 keyPath 取值。属性名中真实的 `.` 需转义为 `&bull;`，`&` 转义为 `&amp;`。
- **`json-treeify.ts`** — 将对象转换为树形字符串。内部调用 `travelJson` 收集节点，用二维数组拼接字符，再通过 `fixArr` 处理末尾分支符号（`├` 改 `└`）。

### CLI（`src/bin/`）
- **`main.ts`** — 共享的 CLI 逻辑，基于 `yargs`，支持 JSON 文件（`-j`）和目录（`-d`）两种输入模式。
- **`j-tree-str.ts`** / **`jtls.ts`** — CLI 入口。`jtls` 会强制设置 `--dir`、`--max=1`、`--outv=0` 后再进入 `main.ts`。
- **`utils/walk-dir.ts`** — 仅 Node 可用，将目录结构转成 JSON。默认过滤 `.git`、`node_modules` 等。

## 构建配置

- `tsconfig.json` — 基座配置；`strictNullChecks: false`，**不使用路径别名**（打包后会导致模块找不到）。
- `tsconfig.esm.json` → `dist/esm`
- `tsconfig.cjs.json` → `dist/cjs`
- `tsconfig.type.json` → `dist/types`（仅生成 `.d.ts`，保留注释）
- `newLine: "lf"` 必须设置，否则 CLI bin 文件在 Unix 下会报错。

## 测试

- 使用 **Jest + ts-jest**，配置在 `jest.config.ts`。
- 测试文件放在 `__tests__/` 目录，匹配 `**/__tests__/**/*.ts`。
