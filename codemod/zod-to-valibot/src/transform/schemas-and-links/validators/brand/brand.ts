import j from 'jscodeshift';

export function transformBrand(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('brand')),
    args
  );
}
