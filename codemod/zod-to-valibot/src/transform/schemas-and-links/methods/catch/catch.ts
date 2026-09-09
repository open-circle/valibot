import j from 'jscodeshift';

// `z.string().catch("x")` -> `v.fallback(v.string(), "x")`
export function transformCatch(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('fallback')
    ),
    [schemaExp, ...args]
  );
}
