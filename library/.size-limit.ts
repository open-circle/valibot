import dedent from 'dedent';
import type { Check, SizeLimitConfig } from 'size-limit';
import * as v from './src';

const path = 'dist/index.js';

const checks: Check[] = [
  {
    name: 'Full bundle',
    path,
    import: '*',
  },
];

const allExports = new Set(Object.keys(v));
// exports such as `null` or `undefined` cannot be used as named imports without suffix
const isReservedName = (name: string) => allExports.has(name + '_');
const isInternal = (name: string) => name.startsWith('_');

/**
 * Build a config for an individual export's size.
 * @param {string} exportName Name of the export.
 * @returns {Check} The config.
 */
function individualExportConfig(exportName: string): Check {
  return {
    name: `\`v.${exportName}\``,
    path,
    import: `{ ${exportName} }`,
  };
}

for (const exportName of allExports) {
  if (isReservedName(exportName) || isInternal(exportName)) continue;
  checks.push(individualExportConfig(exportName));
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
    path,
    import: `{ ${Array.from(uniqueImports).join(', ')} }`,
  };
}

checks.push(
  ts`
  const LoginSchema = v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  });
  const output2 = v.parse(LoginSchema, {
    email: 'jane@example.com',
    password: '12345678',
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
