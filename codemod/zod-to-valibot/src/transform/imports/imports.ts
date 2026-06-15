import j, { type Collection } from 'jscodeshift';

const ZOD_IMPORT_SOURCES_LIST = ['zod', 'zod/v4', 'zod/v4-mini'] as const;
const ZOD_IMPORT_SOURCES = new Set<string>(ZOD_IMPORT_SOURCES_LIST);
const LAST_ZOD_IMPORT_SOURCE =
  ZOD_IMPORT_SOURCES_LIST[ZOD_IMPORT_SOURCES_LIST.length - 1];
const ZOD_IMPORT_SOURCES_LABEL = `${ZOD_IMPORT_SOURCES_LIST.slice(0, -1)
  .map((source) => `"${source}"`)
  .join(', ')}, or "${LAST_ZOD_IMPORT_SOURCE}"`;

type TransformImportsReturn =
  | {
      conclusion: 'skip' | 'unsuccessful';
      cause: string;
      valibotIdentifier?: undefined;
    }
  | { conclusion: 'successful'; valibotIdentifier: string };

export function transformImports(
  root: Collection<unknown>
): TransformImportsReturn {
  // Find all Zod import statements
  const zodImports = root.find(
    j.ImportDeclaration,
    (name) =>
      typeof name.source.value === 'string' &&
      ZOD_IMPORT_SOURCES.has(name.source.value)
  );
  // Check the number of statements is exactly one
  const importNodes = zodImports.nodes();
  if (importNodes.length !== 1) {
    return {
      conclusion: importNodes.length === 0 ? 'skip' : 'unsuccessful',
      cause: `Expected exactly one import statement from ${ZOD_IMPORT_SOURCES_LABEL}.`,
    };
  }
  // Check the number of specifiers is exactly one
  const importSpecifiers = importNodes[0].specifiers;
  if (importSpecifiers?.length !== 1) {
    return {
      conclusion: 'unsuccessful',
      cause: `Expected exactly one import specifier from ${ZOD_IMPORT_SOURCES_LABEL}.`,
    };
  }
  // Obtain the identifier
  const importSpecifier = importSpecifiers[0];
  const zodIdentifier = importSpecifier.local?.name;
  if (typeof zodIdentifier !== 'string') {
    return {
      conclusion: 'unsuccessful',
      cause: 'Expected the import specifier to have a local name.',
    };
  }
  const isZodIdentifierZ = zodIdentifier === 'z';
  const valibotIdentifier = isZodIdentifierZ ? 'v' : zodIdentifier;
  // Transform the import statements
  zodImports.replaceWith(
    j.importDeclaration(
      [j.importNamespaceSpecifier(j.identifier(valibotIdentifier))],
      j.literal('valibot')
    )
  );
  // Transform member expression root if required
  if (isZodIdentifierZ) {
    root
      .find(j.MemberExpression, { object: { name: zodIdentifier } })
      .replaceWith((p) =>
        j.memberExpression(j.identifier(valibotIdentifier), p.node.property)
      );
    root
      .find(j.TSTypeReference, {
        typeName: {
          type: 'TSQualifiedName',
          left: { type: 'Identifier', name: zodIdentifier },
        },
      })
      .filter(
        (p) =>
          p.value.typeName.type === 'TSQualifiedName' &&
          p.value.typeName.right.type === 'Identifier'
      )
      .replaceWith((p) =>
        j.tsTypeReference(
          j.tsQualifiedName(
            j.identifier(valibotIdentifier),
            // todo: find a better way to get the identifier
            p.value.typeName.type === 'TSQualifiedName' &&
              p.value.typeName.right.type === 'Identifier'
              ? p.value.typeName.right
              : j.identifier('bug')
          ),
          p.value.typeParameters
        )
      );
  }
  return {
    conclusion: 'successful',
    valibotIdentifier,
  };
}
