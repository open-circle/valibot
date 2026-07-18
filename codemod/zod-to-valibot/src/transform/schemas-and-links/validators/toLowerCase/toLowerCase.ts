import j from 'jscodeshift';

export function transformToLowerCase(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('toLowerCase')
    ),
    args
  );
}
