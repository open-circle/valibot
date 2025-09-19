import dedent from 'dedent';
import type { Check, SizeLimitConfig } from 'size-limit';
import * as v from './src';

const paths = ['dist/index.js', 'dist/index.cjs'];

const checks = paths.map(
  (path): Check => ({
    name: `Full bundle (${path.includes('.cjs') ? 'CJS' : 'ESM'})`,
    path,
    import: '*',
  })
);

const importNames = new Set(Object.keys(v));
// exports such as `null` or `undefined` cannot be used as named imports without suffix
const isReservedName = (name: string) => importNames.has(name + '_');
const isInternal = (name: string) => name.startsWith('_');

/**
 * Build a config for an individual export's size.
 * @param {string} importName Name of the export.
 * @returns {Check} The config.
 */
function individualExportConfig(importName: string): Check {
  return {
    name: `\`v.${importName}\``,
    // only check ESM individual exports
    path: paths[0],
    import: `{ ${importName} }`,
  };
}

for (const importName of importNames) {
  if (isReservedName(importName) || isInternal(importName)) continue;
  checks.push(individualExportConfig(importName));
}

// a v.<name>( call
const vRegex = /v\.(\w+)\(/g;

/**
 * Build a config for a TypeScript example's size.
 * @param {TemplateStringsArray} strings Template strings.
 * @param {...unknown} values Template values.
 * @returns {Check} The config.
 */
function ts(strings: TemplateStringsArray, ...values: unknown[]): Check {
  const snippet = dedent(strings, ...values);
  const usedImports = Array.from(snippet.matchAll(vRegex), ([, importName]) =>
    isReservedName(importName) ? importName + '_' : importName
  );
  const uniqueImports = new Set(usedImports);
  return {
    name: `\`\`\`ts\n${snippet}\n\`\`\``,
    // ESM only
    path: paths[0],
    import: `{ ${Array.from(uniqueImports).join(', ')} }`,
  };
}

checks.push(
  ts`
  const LoginSchema = v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  })
`,
  ts`
  const PixelSchema = v.pipe(
    v.string(),
    v.regex(/^\d{1,3}px$/),
    v.transform(parseInt),
    v.number(),
    v.maxValue(100),
    v.description('A pixel value between 1 and 100.')
  )
`
);

export default checks satisfies SizeLimitConfig;
