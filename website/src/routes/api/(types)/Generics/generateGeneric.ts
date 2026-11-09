/**
 * Generic argument definition.
 */
export interface GenericArgument {
  name: string;
  constraint: string;
}

/**
 * Creates a module augmentation for a generic constructor.
 */
export function generateGeneric(
  name: string,
  args: readonly GenericArgument[]
): string {
  const quotedName = `'${JSON.stringify(name)
    .slice(1, -1)
    .replace(/\\"/g, '"')
    .replace(/'/g, "\\'")}'`;
  const inferredArgs = args.map((arg) => `infer ${arg.name}`).join(', ');
  const appliedArgs = args.map((arg) => arg.name).join(', ');
  let applyArgs = args.length ? `${name}<${appliedArgs}>` : name;
  for (let index = args.length - 1; index >= 0; index--) {
    const arg = args[index];
    if (arg.constraint.trim()) {
      applyArgs = `[${arg.name}] extends [${arg.constraint}]\n          ? ${applyArgs.replace(/\n/g, '\n  ')}\n          : never`;
    }
  }
  return `import 'valibot';

declare module 'valibot' {
  interface Generics<T, TArgs> {
    ${quotedName}: {
      getArgs: T extends ${name}${args.length ? `<${inferredArgs}>` : ''} ? [${appliedArgs}] : never;
      applyArgs: TArgs extends [${inferredArgs}]
        ? ${applyArgs}
        : never;
    };
  }
}
`;
}
