import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import rehypeShiki from '@shikijs/rehype/core';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import rehypeExternalLinks from 'rehype-external-links';
import { getSingletonHighlighter } from 'shiki';
import shikiBash from 'shiki/langs/bash.mjs';
import shikiJson from 'shiki/langs/json.mjs';
import shikiTypeScript from 'shiki/langs/ts.mjs';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

const highlighter = await getSingletonHighlighter();
await Promise.all([
  highlighter.loadLanguage(shikiTypeScript, shikiBash, shikiJson),
  highlighter.loadTheme(
    JSON.parse(readFileSync('shiki/pace-theme-light+.json', 'utf8')),
    JSON.parse(readFileSync('shiki/pace-theme-dark.json', 'utf8'))
  ),
]);

export default defineConfig(({ isSsrBuild }) => {
  return {
    plugins: [
      qwikCity({
        mdxPlugins: {
          remarkGfm: true,
          rehypeSyntaxHighlight: false,
          rehypeAutolinkHeadings: true,
        },
        mdx: {
          providerImportSource: '~/hooks/useMDXComponents.tsx',
          rehypePlugins: [
            [
              rehypeShiki,
              highlighter,
              {
                themes: {
                  light: 'Pace Light',
                  dark: 'Pace Dark',
                },
              },
            ],
            [rehypeExternalLinks, { rel: 'noreferrer', target: '_blank' }],
          ],
        },
      }),
      qwikVite(),
      tsconfigPaths(),
      !isSsrBuild && nodePolyfills(),
      tailwindcss(),
    ],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
