import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    clean: true,
    format: ['es', 'cjs'],
    minify: false,
    dts: true,
    outDir: './dist',
    target: 'es2020',
  },
  {
    entry: ['./src/index.ts'],
    clean: true,
    format: ['es', 'cjs'],
    minify: true,
    dts: false,
    outDir: './dist',
    target: 'es2020',
    outExtensions: ({ format }) => ({
      js: format === 'cjs' ? '.min.cjs' : '.min.mjs',
    }),
  },
]);
