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
import viteFont from 'vite-font';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

const highlighter = await getSingletonHighlighter();
await Promise.all([
  highlighter.loadLanguage(shikiTypeScript, shikiBash, shikiJson),
  highlighter.loadTheme(
    JSON.parse(
      readFileSync(
        new URL('./shiki/pace-theme-light+.json', import.meta.url),
        'utf8'
      )
    ),
    JSON.parse(
      readFileSync(
        new URL('./shiki/pace-theme-dark.json', import.meta.url),
        'utf8'
      )
    )
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
      // Preloads the Lexend files and generates a metric-matched fallback `@font-face` so swapping
      // the font in does not shift the layout. The files keep shipping from `public/fonts`, so each
      // `path` is read for its metrics only and `url` is what lands in the `@font-face` rule and the
      // preload link — without it the plugin would emit a second, content-hashed copy of the bytes
      // Vite already copies out of `public`. `injectHtml` is off because Qwik renders its own
      // `<head>`, which pulls the tags from `virtual:vite-font` (see `src/components/Head.tsx`).
      viteFont({
        injectHtml: false,
        config: [
          {
            name: 'Lexend',
            src: [
              {
                path: 'public/fonts/lexend-400.woff2',
                style: 'normal',
                weight: '400',
              },
              {
                path: 'public/fonts/lexend-500.woff2',
                style: 'normal',
                weight: '500',
              },
            ],
            preload: true,
            display: 'swap',
            fallback: 'sans-serif',
            cssVariable: 'lexend',
          },
          {
            name: 'Lexend Exa',
            src: [
              {
                path: 'public/fonts/lexend-exa-500.woff2',
                style: 'normal',
                weight: '500',
              },
            ],
            preload: true,
            display: 'swap',
            fallback: 'sans-serif',
            cssVariable: 'lexend-exa',
          },
        ],
      }),
    ],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
