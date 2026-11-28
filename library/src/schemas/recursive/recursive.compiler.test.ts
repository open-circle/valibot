// @vitest-environment node
import * as ts from 'typescript';
import { describe, expect, test } from 'vitest';

const fixture = ts.sys.resolvePath(
  'src/schemas/recursive/recursive-optional.fixture.ts'
);

/**
 * Compiles optional recursive schemas with the selected compiler options.
 *
 * @param async Whether to compile an async schema.
 * @param exactOptionalPropertyTypes Whether to use exact optional properties.
 *
 * @returns The compiler errors.
 */
function compile(async: boolean, exactOptionalPropertyTypes: boolean) {
  const imports = async
    ? 'recursiveAsync as recursive, objectAsync as object, optionalAsync as optional, string'
    : 'recursive, object, optional, string';
  const source = `import { expectTypeOf } from 'vitest';
import { ${imports}, type InferInput, type InferOutput } from '../../index.ts';

interface Node {
  name: string;
  next?: Node | undefined;
}

const schema = recursive((self) => object({
  name: string(),
  next: optional(self),
}));

expectTypeOf<InferInput<typeof schema>>().toEqualTypeOf<Node>();
expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<Node>();

const input: InferInput<typeof schema> = {
  name: 'root',
  next: { name: 'child', next: { name: 'leaf' } },
};
const output: InferOutput<typeof schema> = {
  name: 'root',
  next: { name: 'child', next: { name: 'leaf' } },
};

// @ts-expect-error A nested input name must be a string.
const invalidInput: InferInput<typeof schema> = { name: 'root', next: { name: 123 } };
// @ts-expect-error A nested output name must be a string.
const invalidOutput: InferOutput<typeof schema> = { name: 'root', next: { name: 123 } };
`;
  const options: ts.CompilerOptions = {
    strict: true,
    exactOptionalPropertyTypes,
    skipLibCheck: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2020,
    lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    allowImportingTsExtensions: true,
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

describe.each([false, true])(
  'optional recursion with exactOptionalPropertyTypes: %s',
  (exactOptionalPropertyTypes) => {
    test.each([false, true])(
      'resolves exact input and output types (async: %s)',
      (async) => {
        expect(compile(async, exactOptionalPropertyTypes)).toEqual([]);
      },
      60_000
    );
  }
);
