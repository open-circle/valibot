import j from 'jscodeshift';

export function transformTrim(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('trim')),
    args
  );
}
