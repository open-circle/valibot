import j from 'jscodeshift';

export function transformDescribe(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('description')
    ),
    args
  );
}
