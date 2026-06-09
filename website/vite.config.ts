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
    ],
    // The playground runs user code inside a sandboxed iframe (opaque origin),
    // which loads the Valibot, to-json-schema and i18n bundles via an import
    // map. Those cross-origin module requests require CORS headers, which Vercel
    // adds in production (see vercel.json). Mirror that during local dev so the
    // playground can execute code with `pnpm start`.
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
