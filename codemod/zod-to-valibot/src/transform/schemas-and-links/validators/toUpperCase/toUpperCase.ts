import j from 'jscodeshift';

export function transformToUpperCase(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('toUpperCase')
    ),
    args
  );
}
