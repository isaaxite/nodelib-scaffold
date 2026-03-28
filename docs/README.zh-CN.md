# NodeLib 脚手架

> 📖 [English README](https://github.com/isaaxite/nodelib-scaffold/blob/main/README.md)

一个快速搭建现代化 Node.js 库项目的脚手架工具，支持 TypeScript、Rollup、AVA 测试和 GitHub Actions CI/CD 工作流。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 特性

- 🚀 **TypeScript** - 使用 TypeScript 编写类型安全的代码
- 📦 **Rollup** - 构建 ESM 和 CommonJS 双格式包，支持 Tree-shaking
- 🧪 **AVA** - 快速并发的测试框架，带覆盖率报告
- 🔄 **GitHub Actions** - 自动化测试、版本发布和包发布
- 📊 **测试报告** - 自动在 PR 中生成测试结果和覆盖率评论
- 🏷️ **Release Please** - 自动化版本管理和变更日志生成
- 📦 **双平台发布** - 同时发布到 npm 和 GitHub Packages

## 环境要求

### 系统要求

- Node.js >= 18.0.0
- pnpm（推荐）或 npm

### GitHub 仓库配置

在使用此脚手架前，需要在 GitHub 仓库中配置以下内容：

#### 必需的 Secrets

进入仓库的 **Settings → Secrets and variables → Actions**，添加以下密钥：

| 密钥名称 | 说明 | 用途 |
|---------|------|------|
| `NPM_TOKEN` | npm 认证令牌，用于发布包 | 发布到 npm |
| `GH_TOKEN` | GitHub 个人访问令牌，需要仓库权限 | 跨仓库触发工作流 |
| `GITHUB_TOKEN` | GitHub Actions 自动提供的令牌 | 基础 GitHub API 操作 |

> **注意**：`GITHUB_TOKEN` 由 GitHub Actions 自动提供，无需手动添加。

#### 必需的权限设置

确保配置工作流权限：

1. 进入 **Settings → Actions → General**
2. 在 "Workflow permissions" 部分，选择：
   - **Read and write permissions**
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

#### 可选：Coveralls 集成

如需启用 Coveralls 覆盖率报告：

1. 使用 GitHub 账号登录 [coveralls.io](https://coveralls.io)
2. 添加你的仓库到 Coveralls
3. `COVERALLS_REPO_TOKEN` 将由 `coverallsapp/github-action` 自动处理

#### 配置 NPM Token

如需发布包到 npm：

1. 在 [npmjs.com](https://npmjs.com) 创建账号
2. 生成访问令牌：
   - 进入 npm 账号设置
   - 选择 "Access Tokens"
   - 创建 "Automation" 类型的令牌
3. 在 GitHub 仓库 Secrets 中添加该令牌为 `NPM_TOKEN`

#### 配置 GH_TOKEN

如需启用工作流触发功能：

1. 在 GitHub 生成 Personal Access Token (PAT)：
   - 进入 **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   - 生成新令牌，勾选 `repo` 权限
2. 在仓库 Secrets 中添加该令牌为 `GH_TOKEN`

### GitHub Actions 工作流权限

脚手架包含的工作流需要特定权限。这些已在工作流文件中自动配置，但你应该验证：

- **release-please.yml**：需要 `contents: write`、`pull-requests: write`、`issues: write`
- **publish-package.yml**：需要发布到 npm 和 GitHub Packages 的权限
- **unittests.yml**：需要在 PR 上创建评论的权限

## 安装

### 从 GitHub Packages 安装

由于此工具发布到 GitHub Packages，你需要配置 npm/pnpm 使用 GitHub Package Registry：

#### 方法一：使用 `.npmrc`（推荐）

在家目录创建或编辑 `.npmrc`：

```bash
# 对于 npm
echo "@isaaxite:registry=https://npm.pkg.github.com" >> ~/.npmrc

# 对于 pnpm
echo "@isaaxite:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

然后安装：

```bash
# 使用 npm
npm install -g @isaaxite/nodelib-scaffold

# 使用 pnpm
pnpm add -g @isaaxite/nodelib-scaffold
```

#### 方法二：直接指定 registry 安装

```bash
# 使用 npm
npm install -g @isaaxite/nodelib-scaffold --registry=https://npm.pkg.github.com

# 使用 pnpm
pnpm add -g @isaaxite/nodelib-scaffold --registry=https://npm.pkg.github.com
```

#### 方法三：无需安装直接运行（推荐用于评估）

```bash
# 使用 npx 并指定 GitHub Packages
npx --registry=https://npm.pkg.github.com @isaaxite/nodelib-scaffold

# 使用 pnpm dlx
pnpm dlx --registry=https://npm.pkg.github.com @isaaxite/nodelib-scaffold
```

> **注意**：你需要通过 GitHub Packages 认证。如果遇到认证问题，创建 GitHub Personal Access Token 并设置为环境变量：
>
> ```bash
> export NPM_TOKEN=你的_github_pat
> ```

## 使用方法

### 初始化新项目

在项目目录中运行脚手架工具：

```bash
nodelib-scaffold
```

系统会提示输入 GitHub 仓库信息（所有者/仓库名）：

```
Github <owner/repo> of the project (e.g. "isaaxite/path-treeify")?
```

工具会自动完成以下操作：

1. 创建基础项目结构
2. 生成配置文件（tsconfig.json、rollup.config.mjs 等）
3. 设置 GitHub Actions 工作流
4. 更新 package.json 中的项目信息
5. 安装所有必要的开发依赖

### 项目结构

初始化后的项目结构：

```
.
├── .github/
│   └── workflows/
│       ├── publish-package.yml   # 包发布工作流
│       ├── release-please.yml    # 版本发布自动化
│       └── unittests.yml         # 测试和覆盖率工作流
├── .gitignore
├── docs/
│   └── README.zh-CN.md
├── src/                          # 源代码目录
├── tests/                        # 测试文件目录
├── index.ts                      # 入口文件
├── package.json
├── rollup.config.mjs
├── tsconfig.json
└── README.md
```

### 开发脚本

| 脚本 | 描述 |
|------|------|
| `pnpm dev` | 开发模式，文件变动时自动重新构建 |
| `pnpm build` | 生产环境构建（ESM + CJS） |
| `pnpm test` | 运行 AVA 测试 |
| `pnpm test:coverage` | 运行测试并生成覆盖率报告 |
| `pnpm test:report` | 运行测试并生成 Markdown 报告 |
| `pnpm clean` | 清理构建产物 |
| `pnpm check-publish` | 预览发布内容（dry-run） |

### 编写测试

测试使用 AVA 编写，放在 `tests/` 目录下，文件扩展名为 `.mjs`：

```javascript
import test from 'ava';
import yourFunction from '../dist/index.mjs';

test('应该正确工作', t => {
  t.is(yourFunction('输入'), '期望输出');
});
```

### 测试报告

当创建 Pull Request 时，GitHub Actions 工作流会自动：

- 运行测试并生成覆盖率报告
- 上传覆盖率到 Coveralls
- 在 PR 中评论测试结果，包括：
  - 通过/失败统计
  - 失败的测试详情和错误信息
  - 完整的测试列表（必要时自动截断）

### 发布

#### Beta 版本

当 Release Please 创建 PR 时，会自动发布 beta 版本。版本格式为：

```
<version>-beta.<commit-sha>
```

示例：`1.0.0-beta.a1b2c3d`

#### 正式版本

当 Release Please PR 合并后，会自动发布正式版本到 npm 和/或 GitHub Packages。

#### 手动发布

你也可以手动触发发布：

```bash
# 发布 beta 版本
pnpm run publish:beta

# 发布正式版本
pnpm run publish:latest
```

### 配置文件说明

#### Rollup (`rollup.config.mjs`)

包含完整的 Rollup 配置，支持 TypeScript，生产环境自动压缩，同时构建 ESM 和 CommonJS 格式。

#### TypeScript (`tsconfig.json`)

严格的 TypeScript 配置，针对 Node.js 环境优化模块解析。

#### AVA (`package.json`)

AVA 配置为运行 `tests/` 目录下的测试文件，支持 Node.js ESM 模式。

#### 代码覆盖率 (`c8`)

代码覆盖率阈值在 `package.json` 中配置，默认值：
- 行覆盖率：80%
- 语句覆盖率：80%
- 函数覆盖率：80%
- 分支覆盖率：75%

### GitHub Actions 工作流

#### 测试 CI (`unittests.yml`)

- 在 PR 创建和更新时运行
- 执行测试并生成覆盖率
- 在 PR 中评论测试结果
- 为 Release Please PR 触发 beta 发布

#### 发布包 (`publish-package.yml`)

- 手动触发发布
- 支持 npm 和 GitHub Packages
- 处理 beta 和正式版本

#### Release Please (`release-please.yml`)

- 自动版本管理
- 创建包含变更日志的发布 PR
- 触发测试和发布工作流

## 自定义配置

### 修改测试报告格式

测试报告生成器位于 `.github/scripts/generate-report.js`。你可以自定义：

- 最大评论长度（默认：65000）
- 表格行数限制
- 报告标题
- 失败测试的显示方式

### 修改覆盖率阈值

在 `package.json` 中修改 `c8` 配置：

```json
"c8": {
  "lines": 85,
  "statements": 85,
  "functions": 85,
  "branches": 80
}
```

### 添加更多依赖

脚手架默认安装常用的开发依赖。如需添加更多：

```bash
# 添加开发依赖
pnpm add <package> -D

# 添加生产依赖
pnpm add <package>
```

## 卸载

移除脚手架工具：

```bash
nodelib-scaffold --unload
```

或手动移除：

```bash
pnpm remove -g @isaaxite/nodelib-scaffold
```

## 许可证

[MIT](https://github.com/isaaxite/nodelib-scaffold/blob/main/LICENSE) © [isaaxite](https://github.com/isaaxite)
