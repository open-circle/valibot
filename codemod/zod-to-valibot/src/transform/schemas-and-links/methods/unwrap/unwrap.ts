import j from 'jscodeshift';

export function transformUnwrap(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('unwrap')),
    [schemaExp, ...args]
  );
}
