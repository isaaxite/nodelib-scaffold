import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'index.ts',
  output: [
    // {
    //   dir: 'dist',
    //   format: 'esm',
    //   entryFileNames: '[name].mjs',
    //   sourcemap: !isProduction,
    // },
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      sourcemap: !isProduction,
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      // declaration: false,
      // declarationDir: undefined
    }),
    isProduction && terser({
      // 详细配置见下文
      compress: {
        drop_console: true, // 删除所有 console.* 函数调用
        drop_debugger: true, // 删除 debugger 语句
        pure_funcs: ['console.log'], // 移除指定的纯函数调用
      },
      format: {
        comments: false, // 删除注释
      },
      mangle: true, // 启用名称混淆（变量名缩短）
    }),
    copy({
      targets: [
        { src: 'src/template/**/*', dest: 'dist/template' },
        { src: 'src/template/.gitignore', dest: 'dist/template' },
        { src: 'src/template/.github/scripts/', dest: 'dist/template/.github/' },
        { src: 'src/template/.github/workflows/', dest: 'dist/template/.github/' },
      ]
    }),
  ]
};
