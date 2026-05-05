import j from 'jscodeshift';

export function transformSafeParse(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('safeParse')
    ),
    [schemaExp, ...args]
  );
}
