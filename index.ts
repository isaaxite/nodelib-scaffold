import { join } from 'node:path';
import { copySync, ensureDirSync, ensureFileSync } from 'fs-extra';
import { execSync } from 'node:child_process';
import * as jsonc from 'jsonc-parser';
import { readFileSync, writeFileSync } from 'node:fs';

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

const readPkgJson = () => {
  const pkgPath = getTemplatePathOf('package.json');
  const pkgData = JSON.parse(readFileSync(pkgPath, { encoding: 'utf-8' }));
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

function updatePkgJson() {
  const pkg = readPkgJson();
  const scripts = Object.entries(pkg.scripts).map(([key, value]) => {
    return { path: ['scripts', key], value  };
  });
  editPackageJson('./package.json', [
    { path: ['main'], value: pkg.main },
    { path: ['module'], value: pkg.module },
    { path: ['types'], value: pkg.types },
    { path: ['exports'], value: pkg.exports },
    { path: ['files'], value: pkg.files },
    { path: ['publishConfig'], value: pkg.publishConfig },
    ...scripts,
  ]);
}

function init() {
  ensureFileSync('index.ts');
  ensureFileSync('README.md');
  ensureFileSync('docs/README.zh-CN.md');
  ensureDirSync('src');

  copyTemplateSync('tsconfig.json', 'tsconfig.json');
  copyTemplateSync('rollup.config.mjs', 'rollup.config.mjs');
  copyTemplateSync('.gitignore', '.gitignore');
  copyTemplateSync('.github', '.github');

  updatePkgJson();
  
  execSync(pnpmInstall, { stdio: 'inherit' });
}

function main() {
  init();
}

main();
