import j from 'jscodeshift';

export function transformOr(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  inputArgs: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('union')),
    [j.arrayExpression([schemaExp, ...inputArgs])]
  );
}
