import j from 'jscodeshift';

export function transformElement(
  exp: j.CallExpression | j.MemberExpression | j.Identifier
) {
  return j.memberExpression(exp, j.identifier('item'));
}
