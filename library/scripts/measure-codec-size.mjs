import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const require = createRequire(import.meta.url);
const { build, version } = createRequire(require.resolve('vite/package.json'))(
  'esbuild'
);
const source = resolve(process.argv[2] ?? 'src').replaceAll('\\', '/');
const fixtures = {
  primitive: 'export const run = value => v.parse(v.string(), value);',
  object:
    'export const run = value => v.parse(v.object({ name: v.string(), age: v.number() }), value);',
  array:
    'export const run = value => v.parse(v.array(v.object({ name: v.string() })), value);',
  pipeline:
    'export const run = value => v.parse(v.pipe(v.string(), v.minLength(2), v.transform(s => s.length)), value);',
  defaults:
    'export const run = value => v.parse(v.object({ name: v.optional(v.string(), "Ada") }), value);',
  fallback:
    'export const run = value => v.parse(v.fallback(v.string(), "Ada"), value);',
  variant:
    'export const run = value => v.parse(v.variant("type", [v.object({ type: v.literal("name"), name: v.string() }), v.object({ type: v.literal("age"), age: v.number() })]), value);',
  asyncParse:
    'export const run = value => v.parseAsync(v.objectAsync({ name: v.pipeAsync(v.string(), v.minLength(2)) }), value);',
};
if (process.argv.includes('--codecs')) {
  const codec =
    'const date = v.codec(v.pipe(v.string(), v.isoTimestamp()), v.date(), { decode: s => new Date(s), encode: d => d.toISOString() });';
  fixtures.codecParse = `${codec} export const run = value => v.parse(date, value);`;
  fixtures.codecNested = `${codec} const schema = v.object({ dates: v.array(date) }); export const decode = value => v.decode(schema, value); export const encode = value => v.encode(schema, value);`;
  fixtures.codecAsync =
    'const schema = v.codecAsync(v.string(), v.date(), { decode: async s => new Date(s), encode: async d => d.toISOString() }); export const decode = value => v.decodeAsync(schema, value); export const encode = value => v.encodeAsync(schema, value);';
}
const results = {};
for (const [name, contents] of Object.entries(fixtures)) {
  for (const style of ['namespace', 'named']) {
    const names = [
      ...new Set([...contents.matchAll(/v\.(\w+)/g)].map((match) => match[1])),
    ];
    const imports =
      style === 'namespace'
        ? `import * as v from ${JSON.stringify(`${source}/index.ts`)};`
        : `import { ${names.map((name) => `${name} as v_${name}`).join(', ')} } from ${JSON.stringify(`${source}/index.ts`)};`;
    const result = await build({
      stdin: {
        contents:
          imports +
          (style === 'named'
            ? contents.replaceAll(/v\.(\w+)/g, 'v_$1')
            : contents),
        loader: 'ts',
        resolveDir: process.cwd(),
      },
      bundle: true,
      minify: true,
      treeShaking: true,
      metafile: true,
      format: 'esm',
      target: 'es2020',
      write: false,
    });
    const bytes = result.outputFiles[0].contents;
    if (!name.startsWith('codec')) {
      const inputs = Object.values(result.metafile.outputs)[0].inputs;
      for (const [path, input] of Object.entries(inputs)) {
        if (
          input.bytesInOutput &&
          (path.includes('/schemas/codec/') ||
            path.includes('/utils/_runBackwardPipe/'))
        ) {
          throw new Error(
            `Codec implementation retained in ${name}/${style}: ${path}`
          );
        }
      }
    }
    results[`${name}/${style}`] = {
      minified: bytes.length,
      gzip: gzipSync(bytes).length,
    };
  }
}
console.log(
  JSON.stringify({ esbuild: version, target: 'es2020', results }, null, 2)
);
