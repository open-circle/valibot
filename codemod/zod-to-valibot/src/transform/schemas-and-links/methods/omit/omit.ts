import j from 'jscodeshift';

function toValiOmitArg(omitArg: j.CallExpression['arguments'][number]) {
  if (omitArg.type !== 'ObjectExpression') {
    return null;
  }
  const selectedKeys = omitArg.properties
    .map((p) =>
      p.type === 'ObjectProperty' && p.key.type === 'Identifier'
        ? j.stringLiteral(p.key.name)
        : null
    )
    .filter((v) => v !== null);
  return selectedKeys.length > 0 ? j.arrayExpression(selectedKeys) : null;
}

export function transformOmit(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  inputArgs: j.CallExpression['arguments']
) {
  const args: any[] = [schemaExp];
  const valiOmitArg = toValiOmitArg(inputArgs[0]);
  if (valiOmitArg === null) {
    return schemaExp;
  }
  args.push(valiOmitArg);
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('omit')),
    args
  );
}
