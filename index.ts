import { join } from 'node:path';
import { copySync, ensureDirSync, ensureFileSync, readJSONSync } from 'fs-extra';
import { execSync } from 'node:child_process';
import * as jsonc from 'jsonc-parser';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import prompts from 'prompts';
import minimist from 'minimist';

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

function updatePkgJson({ owner, repo }: { owner: string; repo: string }) {
  const curPkg = readJSONSync('package.json', 'utf-8');
  const backupPath = `/tmp/${curPkg.name}/package.json`;
  try {
    copySync('package.json', backupPath); 
  } catch (error) {
    console.error(error);
  }

  let template = readFileSync(join(
    __dirname,
    'template/package.json'
  ), 'utf-8');

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

async function getOwnerRepo() {
  const { value } = await prompts({
    type: 'text',
    name: 'value',
    message: `Github <owner/repo> of the project (e.g. "isaaxite/path-treeify")?`,
  });

  if (typeof value === 'undefined') {
    process.exit(0);
  }

  if (!value) {
    return await getOwnerRepo();
  }

  return value;
}

async function initial() {
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
  const args = minimist(process.argv.slice(2), {
    boolean: ['unload'],
  });

  if (args.unload) {
    let pkgname;
    try {
      pkgname = readJSONSync(join(__dirname, '../package.json'), { encoding: 'utf-8' }).name;
    } catch (error) {
      pkgname = '@isaaxite/nodelib-scaffold';
    }
    execSync(`pnpm remove ${pkgname}`, { stdio: 'inherit' });
  } else {
    return initial().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}

main();

function copyTemplateSync(segment: string, dest: string) {
  const path = join(__dirname, 'template', segment);
  copySync(path, dest);
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
