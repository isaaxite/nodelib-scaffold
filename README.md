# NodeLib Scaffold

> 📖 [中文文档 (Chinese README)](https://github.com/isaaxite/nodelib-scaffold/blob/main/docs/README.zh-CN.md)

A scaffolding tool to quickly set up a modern Node.js library with TypeScript, Rollup, AVA testing, and GitHub Actions CI/CD workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## Features

- 🚀 **TypeScript** - Write type-safe code with full TypeScript support
- 📦 **Rollup** - Build ESM and CommonJS bundles with tree-shaking
- 🧪 **AVA** - Fast, concurrent testing with coverage reporting
- 🔄 **GitHub Actions** - Automated testing, release management, and publishing
- 📊 **Test Reports** - Auto-generated PR comments with test results and coverage
- 🏷️ **Release Please** - Automated versioning and changelog generation
- 📦 **Dual Publishing** - Publish to both npm and GitHub Packages

## Prerequisites

### System Requirements

- Node.js >= 18.0.0
- pnpm (recommended) or npm

### GitHub Repository Configuration

Before using this scaffold, you need to configure the following in your GitHub repository:

#### Required Secrets

Go to your repository's **Settings → Secrets and variables → Actions** and add these secrets:

| Secret Name | Description | Required For |
|------------|-------------|--------------|
| `NPM_TOKEN` | npm authentication token for publishing packages | Publishing to npm |
| `GH_TOKEN` | GitHub Personal Access Token with repo permissions | Triggering workflows across repositories |
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions | Basic GitHub API operations |

> **Note**: `GITHUB_TOKEN` is automatically available to GitHub Actions workflows. You don't need to manually add it.

#### Required Permissions

Ensure your workflow permissions are configured:

1. Go to **Settings → Actions → General**
2. Under "Workflow permissions", select:
   - **Read and write permissions**
   - Check "Allow GitHub Actions to create and approve pull requests"

#### Optional: Coveralls Integration

To enable coverage reporting with Coveralls:

1. Sign up at [coveralls.io](https://coveralls.io) with your GitHub account
2. Add your repository to Coveralls
3. The `COVERALLS_REPO_TOKEN` will be automatically handled by the `coverallsapp/github-action`

#### Setting Up NPM Token

To publish packages to npm:

1. Create an npm account at [npmjs.com](https://npmjs.com)
2. Generate an access token:
   - Go to your npm account settings
   - Select "Access Tokens"
   - Create a new token with "Automation" type
3. Add the token as `NPM_TOKEN` in your GitHub repository secrets

#### Setting Up GH_TOKEN

To enable workflow triggering capabilities:

1. Generate a Personal Access Token (PAT) at GitHub:
   - Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   - Generate new token with `repo` scope
2. Add the token as `GH_TOKEN` in your repository secrets

### GitHub Actions Workflow Permissions

The scaffold includes workflows that require specific permissions. These are automatically configured in the workflow files, but you should verify:

- **release-please.yml**: Requires `contents: write`, `pull-requests: write`, `issues: write`
- **publish-package.yml**: Requires ability to publish to npm and GitHub Packages
- **unittests.yml**: Requires ability to create comments on PRs

## Installation

### Install from GitHub Packages

Since this tool is published to GitHub Packages, you need to configure npm/pnpm to use the GitHub Package Registry:

#### Method 1: Using `.npmrc` (Recommended)

Create or edit `.npmrc` in your home directory:

```bash
# For npm
echo "@isaaxite:registry=https://npm.pkg.github.com" >> ~/.npmrc

# For pnpm
echo "@isaaxite:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

Then install:

```bash
# Using npm
npm install -g @isaaxite/nodelib-scaffold

# Using pnpm
pnpm add -g @isaaxite/nodelib-scaffold
```

#### Method 2: Direct installation with registry

```bash
# Using npm
npm install -g @isaaxite/nodelib-scaffold --registry=https://npm.pkg.github.com

# Using pnpm
pnpm add -g @isaaxite/nodelib-scaffold --registry=https://npm.pkg.github.com
```

#### Method 3: Run without installation (Recommended for evaluation)

```bash
# Using npx with GitHub Packages
npx --registry=https://npm.pkg.github.com @isaaxite/nodelib-scaffold

# Using pnpm dlx
pnpm dlx --registry=https://npm.pkg.github.com @isaaxite/nodelib-scaffold
```

> **Note**: You need to be authenticated with GitHub Packages. If you encounter authentication issues, create a GitHub Personal Access Token and set it as an environment variable:
>
> ```bash
> export NPM_TOKEN=your_github_pat
> ```

## Usage

### Initialize a new project

Run the scaffold tool in your project directory:

```bash
nodelib-scaffold
```

You'll be prompted to enter your GitHub repository information (owner/repo):

```
Github <owner/repo> of the project (e.g. "isaaxite/path-treeify")?
```

The tool will then:

1. Create the basic project structure
2. Generate configuration files (tsconfig.json, rollup.config.mjs, etc.)
3. Set up GitHub Actions workflows
4. Update package.json with your project details
5. Install all required dev dependencies

### Project Structure

After initialization, your project will look like:

```
.
├── .github/
│   └── workflows/
│       ├── publish-package.yml   # Package publishing workflow
│       ├── release-please.yml    # Release automation
│       └── unittests.yml         # Test and coverage workflow
├── .gitignore
├── docs/
│   └── README.zh-CN.md
├── src/                          # Your source code
├── tests/                        # Test files
├── index.ts                      # Entry point
├── package.json
├── rollup.config.mjs
├── tsconfig.json
└── README.md
```

### Development Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Development mode with auto-rebuild on changes |
| `pnpm build` | Build for production (ESM + CJS) |
| `pnpm test` | Run AVA tests |
| `pnpm test:coverage` | Run tests with coverage reporting |
| `pnpm test:report` | Run tests with coverage and generate markdown report |
| `pnpm clean` | Clean build artifacts |
| `pnpm check-publish` | Dry-run package publication |

### Writing Tests

Tests are written using AVA and should be placed in the `tests/` directory with `.mjs` extension:

```javascript
import test from 'ava';
import yourFunction from '../dist/index.mjs';

test('should work correctly', t => {
  t.is(yourFunction('input'), 'expected output');
});
```

### Test Reports

When a Pull Request is created, the GitHub Actions workflow automatically:

- Runs tests with coverage
- Uploads coverage to Coveralls
- Comments on the PR with test results including:
  - Pass/fail statistics
  - Failed test details with error messages
  - Complete test table (truncated if necessary)

### Publishing

#### Beta Releases

Beta versions are automatically published when a Release Please PR is created. The version format is:

```
<version>-beta.<commit-sha>
```

Example: `1.0.0-beta.a1b2c3d`

#### Latest Releases

When the Release Please PR is merged, a stable version is automatically published to npm and/or GitHub Packages.

#### Manual Publishing

You can also manually trigger publishing:

```bash
# Publish beta version
pnpm run publish:beta

# Publish latest version
pnpm run publish:latest
```

### Configuration Files

#### Rollup (`rollup.config.mjs`)

The scaffold includes a rollup configuration that builds both ESM and CommonJS bundles with TypeScript support and minification in production.

#### TypeScript (`tsconfig.json`)

Strict TypeScript configuration with proper module resolution for Node.js.

#### AVA (`package.json`)

AVA is configured to run test files from the `tests/` directory with Node.js ESM support.

#### Code Coverage (`c8`)

Code coverage thresholds are configured in `package.json` with defaults:

- Lines: 80%
- Statements: 80%
- Functions: 80%
- Branches: 75%

### GitHub Actions Workflows

#### Test CI (`unittests.yml`)

- Runs on PR creation and updates
- Executes tests with coverage
- Comments test results on the PR
- Triggers beta publishing for Release Please PRs

#### Publish Package (`publish-package.yml`)

- Manual trigger for publishing
- Supports both npm and GitHub Packages
- Handles beta and latest releases

#### Release Please (`release-please.yml`)

- Automatic version management
- Creates release PRs with changelog
- Triggers testing and publishing workflows

## Customization

### Modifying Test Report Format

The test report generator is located at `.github/scripts/generate-report.js`. You can customize:

- Maximum comment length (default: 65000)
- Table row limits
- Report title
- Failed test display

### Changing Coverage Thresholds

Update the `c8` section in `package.json`:

```json
"c8": {
  "lines": 85,
  "statements": 85,
  "functions": 85,
  "branches": 80
}
```

### Adding More Dependencies

The scaffold installs common dev dependencies by default. To add more:

```bash
pnpm add <package> -D
```

For production dependencies:

```bash
pnpm add <package>
```

## Uninstalling

To remove the scaffold tool:

```bash
nodelib-scaffold --unload
```

Or manually:

```bash
pnpm remove -g @isaaxite/nodelib-scaffold
```

## License

[MIT](https://github.com/isaaxite/nodelib-scaffold/blob/main/LICENSE) © [isaaxite](https://github.com/isaaxite)
