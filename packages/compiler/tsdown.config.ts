import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: [
      './src/index.ts',
      './src/plugin/vite.ts',
      './src/plugin/rollup.ts',
      './src/plugin/rolldown.ts',
      './src/plugin/esbuild.ts',
      './src/plugin/webpack.ts',
      './src/plugin/rspack.ts',
    ],
    clean: true,
    format: ['es', 'cjs'],
    minify: false,
    dts: true,
    outDir: './dist',
  },
]);
