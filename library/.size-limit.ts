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
  // if it's a reserved name or internal, skip it
  if (importNames.has(importName + '_') || importName.startsWith('_')) continue;
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
  const dedented = dedent(strings, ...values);
  const usedImports = Array.from(dedented.matchAll(vRegex)).map((m) => m[1]);
  const uniqueImports = Array.from(new Set(usedImports)).map((importName) =>
    importNames.has(importName + '_') ? importName + '_' : importName
  );
  return {
    name: `\`\`\`ts\n${dedented}\n\`\`\``,
    // ESM only
    path: paths[0],
    import: `{ ${uniqueImports.join(', ')} }`,
  };
}

checks.push(
  ts`
  v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  })
`
);

export default checks satisfies SizeLimitConfig;
