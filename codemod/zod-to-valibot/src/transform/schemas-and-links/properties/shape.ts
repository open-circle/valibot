import j from 'jscodeshift';

export function transformShape(
  exp: j.CallExpression | j.MemberExpression | j.Identifier
) {
  return j.memberExpression(exp, j.identifier('entries'));
}
