import j from 'jscodeshift';

export function transformExclude(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('exclude')
    ),
    [schemaExp, ...args]
  );
}
