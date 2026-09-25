import j from 'jscodeshift';

// `z.string().pipe(z.number())` -> `v.pipe(v.string(), v.number())`
export function transformPipe(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('pipe')),
    [schemaExp, ...args]
  );
}
