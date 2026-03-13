import j from 'jscodeshift';

function toValiRequiredArg(requiredArg: j.CallExpression['arguments'][number]) {
  if (requiredArg.type !== 'ObjectExpression') {
    return null;
  }
  const selectedKeys = requiredArg.properties
    .map((p) =>
      p.type === 'ObjectProperty' && p.key.type === 'Identifier'
        ? j.stringLiteral(p.key.name)
        : null
    )
    .filter((v) => v !== null);
  return j.arrayExpression(selectedKeys);
}

export function transformRequired(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  inputArgs: j.CallExpression['arguments']
) {
  const args: any[] = [schemaExp];
  const valiRequiredArg =
    inputArgs.length > 0 ? toValiRequiredArg(inputArgs[0]) : null;
  if (valiRequiredArg !== null) {
    if (valiRequiredArg.elements.length === 0) {
      return schemaExp;
    }
    args.push(valiRequiredArg);
  }
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('required')
    ),
    args
  );
}
