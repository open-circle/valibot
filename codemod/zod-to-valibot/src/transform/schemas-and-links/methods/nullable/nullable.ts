import j from 'jscodeshift';

export function transformNullable(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('nullable')
    ),
    [schemaExp, ...args]
  );
}
