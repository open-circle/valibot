import j from 'jscodeshift';

export function transformExtract(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('picklist')
    ),
    [...args]
  );
}
