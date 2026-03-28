import { join } from 'node:path';
import { copySync, ensureDirSync, ensureFileSync } from 'fs-extra';
import { execSync } from 'node:child_process';
import * as jsonc from 'jsonc-parser';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import prompts from 'prompts';

const libs = [
  '@rollup/plugin-terser',
  '@rollup/plugin-typescript',
  '@types/node',
  'nodemon',
  'rimraf',
  'rollup',
  'tsx',
  'tslib',
  'typescript',
  'ava',
  'c8',
  'tap-json',
];

const pnpmInstall = `pnpm add ${libs.join(' ')} -D`;

function cleanup() {
  execSync(`pnpm remove ${libs.join(' ')}`, { stdio: 'inherit' });
}

const copyTemplateSync = (segment: string, dest: string) => {
  const path = join(__dirname, 'template', segment);
  copySync(path, dest);
};

const getTemplatePathOf = (segment: string) => {
  const path = join(__dirname, 'template', segment);
  return path;
};

const readPkgJson = (path: string) => {
  const pkgData = JSON.parse(readFileSync(path, { encoding: 'utf-8' }));
  return pkgData;
};

function editPackageJson(filePath: string, edits: Array<any>) {
  const raw = readFileSync(filePath, 'utf8');

  // edits 是 [{ path, value }] 数组
  let result = raw;
  for (const { path, value } of edits) {
    const editOps = jsonc.modify(result, path, value, {
      formattingOptions: { insertSpaces: true, tabSize: 2 },
    });
    result = jsonc.applyEdits(result, editOps);
  }

  writeFileSync(filePath, result);
}

function updatePkgJson({ owner, repo }: { owner: string; repo: string }) {
  const curPkg = readPkgJson('package.json');
  const backupPath = `/tmp/${curPkg.name}/package.json`;
  try {
    copySync('package.json', backupPath); 
  } catch (error) {
    console.error(error);
  }

  let template = readFileSync(
    getTemplatePathOf('package.json'),
    { encoding: 'utf-8' },
  );

  try {
    template = template.replace(/<owner>/g, owner).replace(/<repo>/g, repo);
  } catch (error) {
    console.error(error);
  }

  try {
    writeFileSync('package.json', template, 'utf-8');

    const arr = [
      { path: ['name'], value: curPkg.name },
      { path: ['version'], value: curPkg.version },
    ];

    if (curPkg.description) {
      arr.push({ path: ['description'], value: curPkg.description });
    }

    if (curPkg.dependencies) {
      arr.push({ path: ['dependencies'], value: curPkg.dependencies });
    }

    if (curPkg.devDependencies) {
      arr.push({ path: ['devDependencies'], value: curPkg.devDependencies });
    }

    if (curPkg.repository?.url) {
      arr.push({ path: ['repository', 'url'], value: curPkg.repository.url });
    }

    if (curPkg.keywords) {
      arr.push({ path: ['keywords'], value: curPkg.keywords });
    }

    if (curPkg.license) {
      arr.push({ path: ['license'], value: curPkg.license });
    }

    editPackageJson('./package.json', arr);

    rmSync(backupPath);
  } catch (error) {
    console.error(error);
  }
}

async function init() {
  const getOwnerRepo = async () => {
    const { value } = await prompts({
      type: 'text',
      name: 'value',
      message: `Github <owner/repo> of the project (e.g. "isaaxite/path-treeify")?`,
    });

    if (typeof value === 'undefined') {
      process.exit(0);
    }

    if (!value) {
      return getOwnerRepo();
    }

    return value;
  }

  const [owner, repo] = (await getOwnerRepo()).split('/');

  ensureFileSync('index.ts');
  ensureFileSync('README.md');
  ensureFileSync('docs/README.zh-CN.md');
  ensureDirSync('src');
  ensureDirSync('tests');

  copyTemplateSync('tsconfig.json', 'tsconfig.json');
  copyTemplateSync('rollup.config.mjs', 'rollup.config.mjs');
  copyTemplateSync('node.gitignore', '.gitignore');
  copyTemplateSync('github-action', '.github');

  updatePkgJson({ owner, repo });
  
  execSync(pnpmInstall, { stdio: 'inherit' });
}

function main() {
  init();
}

main();
