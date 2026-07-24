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
  inputArgs: j.CallExpression['arguments'],
  isStandaloneCall = false
) {
  // Function-call form: z.partial(Schema, options?) — Zod v4 standalone API.
  // inputArgs[0] is the schema itself (not a key-selector object), so use it
  // as the first argument and pull the optional key selector from inputArgs[1].
  if (isStandaloneCall && inputArgs.length > 0) {
    const schemaArg = inputArgs[0] as j.CallExpression | j.MemberExpression | j.Identifier;
    const optionsArg = inputArgs.length > 1 ? inputArgs[1] : null;
    const args: any[] = [schemaArg];
    if (optionsArg !== null) {
      const valiArg = toValiPartialArg(optionsArg);
      if (valiArg !== null) {
        if (valiArg.elements.length === 0) return schemaArg;
        args.push(valiArg);
      }
    }
    return j.callExpression(
      j.memberExpression(j.identifier(valibotIdentifier), j.identifier('partial')),
      args
    );
  }

  // Method-chain form: Schema.partial(options?)
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
