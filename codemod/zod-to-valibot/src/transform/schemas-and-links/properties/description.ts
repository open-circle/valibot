import j from 'jscodeshift';

export function transformDescription(
  valibotIdentifier: string,
  exp: j.CallExpression | j.MemberExpression | j.Identifier
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('getDescription')
    ),
    [exp]
  );
}
