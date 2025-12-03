import j from 'jscodeshift';

export function getValidatorMsg(
  msgArg: j.CallExpression['arguments'][number] | null
) {
  if (msgArg === null) {
    return null;
  }
  if (msgArg.type !== 'ObjectExpression') {
    return msgArg;
  }
  const msgVals = msgArg.properties
    .map((p) =>
      p.type === 'ObjectProperty' &&
      p.key.type === 'Identifier' &&
      p.key.name === 'message'
        ? p.value
        : null
    )
    .filter((v) => v !== null);
  const msgVal = msgVals.at(0);
  return msgVal === undefined ||
    msgVal.type === 'RestElement' ||
    msgVal.type === 'SpreadElementPattern' ||
    msgVal.type === 'PropertyPattern' ||
    msgVal.type === 'ObjectPattern' ||
    msgVal.type === 'ArrayPattern' ||
    msgVal.type === 'AssignmentPattern' ||
    msgVal.type === 'SpreadPropertyPattern' ||
    msgVal.type === 'TSParameterProperty'
    ? null
    : msgVal;
}

export function transformUnimplemented(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  validatorName: string
) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier(validatorName)
    ),
    args
  );
}
