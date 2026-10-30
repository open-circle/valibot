import j from 'jscodeshift';

// `z.string().and(z.number())` -> `v.intersect([v.string(), v.number()])`
export function transformAnd(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  inputArgs: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('intersect')
    ),
    [j.arrayExpression([schemaExp, ...inputArgs])]
  );
}
