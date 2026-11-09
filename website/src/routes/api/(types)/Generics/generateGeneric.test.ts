import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';
import { generateGeneric } from './generateGeneric.ts';

/**
 * Compiles generated registrations without writing fixture files.
 */
function compile(source: string): string[] {
  const fixture = resolve(import.meta.dirname, 'generated.fixture.ts');
  const options: ts.CompilerOptions = {
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowImportingTsExtensions: true,
    types: [],
    paths: {
      valibot: [
        resolve(import.meta.dirname, '../../../../../../library/src/index.ts'),
      ],
    },
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile;
  host.readFile = (path) => (path === fixture ? source : readFile(path));
  const program = ts.createProgram([fixture], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );
}

const assertions = `
import type * as v from 'valibot';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
`;

test('indents nested constraints', () => {
  const source = generateGeneric('Triple', [
    { name: 'A', constraint: 'object' },
    { name: 'B', constraint: '' },
    { name: 'C', constraint: 'string' },
  ]);
  assert.ok(
    source.includes(`      applyArgs: TArgs extends [infer A, infer B, infer C]
        ? [A] extends [object]
          ? [C] extends [string]
            ? Triple<A, B, C>
            : never
          : never
        : never;`)
  );
});

test('uses single quotes and escapes property names', () => {
  for (const name of ['WeakMap', "A'B", 'A\\\\B', 'A"B', 'A\\nB']) {
    const source = generateGeneric(name, []);
    const property = source.split('\n').find((line) => line.endsWith(': {'));
    assert.ok(property);
    const quoted = property.trim().slice(0, -3);
    assert.equal(quoted[0], "'");
    assert.equal(quoted.at(-1), "'");
    const parsed = ts.createSourceFile(
      'property.ts',
      `interface Example { ${quoted}: unknown }`,
      ts.ScriptTarget.Latest
    );
    const declaration = parsed.statements[0] as ts.InterfaceDeclaration;
    assert.equal((declaration.members[0].name as ts.StringLiteral).text, name);
  }
});

test('generates a constrained WeakMap registration', () => {
  const source = generateGeneric('WeakMap', [
    { name: 'K', constraint: 'object' },
    { name: 'V', constraint: '' },
  ]);
  assert.deepEqual(
    compile(`${source}${assertions}
type Extracted = Assert<Equal<v.Generics<WeakMap<object, string>, never>['WeakMap']['getArgs'], [object, string]>>;
type Unmatched = Assert<Equal<v.Generics<string, never>['WeakMap']['getArgs'], never>>;
type Applied = Assert<Equal<v.Generics<never, [object, number]>['WeakMap']['applyArgs'], WeakMap<object, number>>>;
type Invalid = Assert<Equal<v.Generics<never, [string, number]>['WeakMap']['applyArgs'], never>>;
`),
    []
  );
});

test('generates an unconstrained registration with three arguments', () => {
  const source = generateGeneric('Triple', [
    { name: 'A', constraint: '' },
    { name: 'B', constraint: '' },
    { name: 'C', constraint: '' },
  ]);
  assert.deepEqual(
    compile(`${source}${assertions}
interface Triple<A, B, C> { first: A; second: B; third: C }
type Extracted = Assert<Equal<v.Generics<Triple<string, number, boolean>, never>['Triple']['getArgs'], [string, number, boolean]>>;
type Applied = Assert<Equal<v.Generics<never, [number, boolean, string]>['Triple']['applyArgs'], Triple<number, boolean, string>>>;
`),
    []
  );
});

test('generates constraints that reference another argument', () => {
  const source = generateGeneric('Entry', [
    { name: 'TObject', constraint: 'object' },
    { name: 'TKey', constraint: 'keyof TObject' },
  ]);
  assert.deepEqual(
    compile(`${source}${assertions}
interface Entry<TObject extends object, TKey extends keyof TObject> { object: TObject; key: TKey }
type Extracted = Assert<Equal<v.Generics<Entry<{ name: string }, 'name'>, never>['Entry']['getArgs'], [{ name: string }, 'name']>>;
type Applied = Assert<Equal<v.Generics<never, [{ name: string }, 'name']>['Entry']['applyArgs'], Entry<{ name: string }, 'name'>>>;
type Invalid = Assert<Equal<v.Generics<never, [{ name: string }, 'missing']>['Entry']['applyArgs'], never>>;
`),
    []
  );
});
