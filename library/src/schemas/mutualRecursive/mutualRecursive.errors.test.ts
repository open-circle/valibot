// @vitest-environment node
import * as ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';

const fixture = ts.sys.resolvePath(
  'src/schemas/mutualRecursive/mutualRecursive-error.fixture.ts'
);

/**
 * Compiles the test cases in one virtual file.
 *
 * @param body The TypeScript source for the test cases.
 * @param async Whether to compile the async equivalents.
 *
 * @returns The source and compiler errors.
 */
function compile(body: string, async: boolean) {
  const imports = async
    ? 'recursiveAsync as recursive, objectAsync as object, arrayAsync as array, optionalAsync as optional, string, pipeAsync as pipe, transformAsync as transform'
    : 'recursive, object, array, optional, string, pipe, transform';
  const source = `import { ${imports.replace('recursive, ', '')} } from '../../index.ts';\nimport { mutualRecursive as recursive } from './mutualRecursive.ts';\n${body}`;
  const options: ts.CompilerOptions = {
    strict: true,
    exactOptionalPropertyTypes: true,
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
  const fixtureSource = program.getSourceFile(fixture);
  const implementationSource = program.getSourceFile(
    ts.sys.resolvePath('src/schemas/mutualRecursive/mutualRecursive.ts')
  );
  if (!fixtureSource || !implementationSource) {
    throw new Error('Expected the fixture and mutualRecursive source files.');
  }
  const diagnostics = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(fixtureSource),
    ...program.getSemanticDiagnostics(implementationSource),
  ];
  return { source, diagnostics };
}

describe.each([false])(
  'recursive compiler diagnostics (async: %s)',
  (async) => {
    const valid = `const schemas = recursive((ref) => ({
  a: object({ bs: array(ref('b')) }),
  b: object({ parent: optional(ref('a')) }),
}));`;
    const missingLabel = `recursive((ref) => ({
  a: object({ bs: array(ref('b')), bad: ref() }),
  b: object({ parent: optional(ref('a')) }),
}));`;
    const unmatched = [
      {
        name: 'an unmatched reference in a mutually recursive input and output',
        body: `recursive((ref) => ({
  a: object({ bs: array(ref('b')), bad: ref('typo') }),
  b: object({ parent: optional(ref('a')) }),
}));`,
      },
      {
        name: 'an unmatched input reference removed by a transform in mutual recursion',
        body: `recursive((ref) => ({
  a: pipe(
    object({ bs: array(ref('b')), bad: ref('typo') }),
    transform(${async ? 'async ' : ''}(value) => ({ bs: value.bs }))
  ),
  b: object({ parent: optional(ref('a')) }),
}));`,
      },
    ];
    let compiled: ReturnType<typeof compile>;

    beforeAll(() => {
      compiled = compile(
        [valid, ...unmatched.map(({ body }) => body), missingLabel].join('\n'),
        async
      );
      expect(compiled.diagnostics).toHaveLength(3);
    }, 60_000);

    /**
     * Selects the compiler errors for one test case.
     *
     * @param body The TypeScript source for the test case.
     *
     * @returns The compiler errors within the test case.
     */
    function diagnosticsFor(body: string) {
      const start = compiled.source.indexOf(body);
      expect(start).toBeGreaterThanOrEqual(0);
      return compiled.diagnostics.filter(
        (diagnostic) =>
          diagnostic.file?.fileName === fixture &&
          diagnostic.start !== undefined &&
          diagnostic.start >= start &&
          diagnostic.start < start + body.length
      );
    }

    test('accepts two definitions that reference each other', () => {
      expect(diagnosticsFor(valid)).toEqual([]);
    });

    test.each(unmatched)(
      'rejects $name with the exact labelled error type',
      ({ body }) => {
        const { source } = compiled;
        const diagnostics = diagnosticsFor(body);
        expect(diagnostics).toHaveLength(1);
        const diagnostic = diagnostics[0];
        expect(diagnostic.file?.fileName).toBe(fixture);
        expect(diagnostic.category).toBe(ts.DiagnosticCategory.Error);
        expect(diagnostic.code).toBe(2322);
        expect(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        ).toContain(`Error<"Unmatched recursive reference: 'typo'">`);
        const start = source.indexOf('({\n  a:', source.indexOf(body));
        expect(diagnostic.start).toBe(start);
        expect(diagnostic.length).toBe(
          body.slice(body.indexOf('({'), body.lastIndexOf(')')).length
        );
      },
      60_000
    );

    test('rejects a reference call without a label at that call', () => {
      const { source } = compiled;
      const diagnostics = diagnosticsFor(missingLabel);
      expect(diagnostics).toHaveLength(1);
      const diagnostic = diagnostics[0];
      expect(diagnostic.file?.fileName).toBe(fixture);
      expect(diagnostic.code).toBe(2554);
      expect(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      ).toBe('Expected 1 arguments, but got 0.');
      expect(diagnostic.start).toBe(source.indexOf('ref()'));
      expect(diagnostic.length).toBe(3);
    }, 60_000);
  }
);
