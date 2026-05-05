import j from 'jscodeshift';

function isInlineObjectCall(exp: j.CallExpression): boolean {
  return (
    exp.callee.type === 'MemberExpression' &&
    exp.callee.property.type === 'Identifier' &&
    exp.callee.property.name === 'object'
  );
}

function extractObjectProperties(
  exp: j.CallExpression
): j.ObjectExpression['properties'] {
  const firstArg = exp.arguments[0];
  if (firstArg && firstArg.type === 'ObjectExpression') {
    return firstArg.properties;
  }
  return [];
}

export function transformExtend(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  const extensionObject = args[0];
  const objectProperties: j.ObjectExpression['properties'] = [];

  // Handle base schema
  if (schemaExp.type === 'CallExpression' && isInlineObjectCall(schemaExp)) {
    // Inline the properties from the base schema
    const baseSchemaProperties = extractObjectProperties(schemaExp);
    objectProperties.push(...baseSchemaProperties);
  } else {
    // Use spread with .entries for schema reference
    const schemaEntries = j.memberExpression(
      schemaExp,
      j.identifier('entries')
    );

    if (schemaExp.type === 'Identifier') {
      schemaEntries.comments = [
        j.block(
          `@valibot-migrate we can't detect if ${schemaExp.name} has a \`pipe\` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline`,
          true,
          false
        ),
      ];
    }

    objectProperties.push(j.spreadElement(schemaEntries));
  }

  // Handle extension object
  if (extensionObject.type === 'ObjectExpression') {
    // Inline the extension properties
    objectProperties.push(...extensionObject.properties);
  } else if (extensionObject.type !== 'SpreadElement') {
    // Spread the extension object
    objectProperties.push(j.spreadElement(extensionObject));
  } else {
    objectProperties.push(j.spreadElement(extensionObject.argument));
  }

  const extendedObject = j.objectExpression(objectProperties);

  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('object')),
    [extendedObject]
  );
}
