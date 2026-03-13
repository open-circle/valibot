import j from 'jscodeshift';

export function splitLastArg(
  maxArgs: number,
  args: j.CallExpression['arguments']
): {
  firstArgs: j.CallExpression['arguments'];
  lastArg: j.CallExpression['arguments'][number] | null;
} {
  let firstArgs = args;
  let lastArg: j.CallExpression['arguments'][number] | null = null;
  if (args.length === maxArgs && maxArgs > 0) {
    firstArgs = args.slice(0, args.length - 1);
    lastArg = args[args.length - 1];
  }
  return { firstArgs, lastArg };
}

const isPipeSchemaExp = (callExp: j.CallExpression) =>
  callExp.callee.type === 'MemberExpression' &&
  callExp.callee.property.type === 'Identifier' &&
  callExp.callee.property.name === 'pipe';

export function addToPipe(
  valibotIdentifier: string,
  addTo: j.CallExpression | j.MemberExpression | j.Identifier,
  add: j.CallExpression
): j.CallExpression {
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('pipe')),
    [
      ...(addTo.type === 'CallExpression' && isPipeSchemaExp(addTo)
        ? addTo.arguments
        : [addTo]),
      add,
    ]
  );
}
