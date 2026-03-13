import j from 'jscodeshift';

function toValiPartialArg(partialArg: j.CallExpression['arguments'][number]) {
  if (partialArg.type !== 'ObjectExpression') {
    return null;
  }
  const selectedKeys = partialArg.properties
    .map((p) =>
      p.type === 'ObjectProperty' && p.key.type === 'Identifier'
        ? j.stringLiteral(p.key.name)
        : null
    )
    .filter((v) => v !== null);
  return j.arrayExpression(selectedKeys);
}

export function transformPartial(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  inputArgs: j.CallExpression['arguments']
) {
  const args: any[] = [schemaExp];
  const valiPartialArg =
    inputArgs.length > 0 ? toValiPartialArg(inputArgs[0]) : null;
  if (valiPartialArg !== null) {
    if (valiPartialArg.elements.length === 0) {
      return schemaExp;
    }
    args.push(valiPartialArg);
  }
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('partial')
    ),
    args
  );
}
