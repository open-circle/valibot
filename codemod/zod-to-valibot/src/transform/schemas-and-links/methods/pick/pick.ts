import j from 'jscodeshift';

function toValiPickArg(pickArg: j.CallExpression['arguments'][number]) {
  if (pickArg.type !== 'ObjectExpression') {
    return null;
  }
  const pickedKeys = pickArg.properties
    .map((p) =>
      p.type === 'ObjectProperty' && p.key.type === 'Identifier'
        ? j.stringLiteral(p.key.name)
        : null
    )
    .filter((v) => v !== null);
  return pickedKeys.length > 0 ? j.arrayExpression(pickedKeys) : null;
}

export function transformPick(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  inputArgs: j.CallExpression['arguments']
) {
  const args: any[] = [schemaExp];
  const valiPickArg = toValiPickArg(inputArgs[0]);
  if (valiPickArg === null) {
    return schemaExp;
  }
  args.push(valiPickArg);
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('pick')),
    args
  );
}
