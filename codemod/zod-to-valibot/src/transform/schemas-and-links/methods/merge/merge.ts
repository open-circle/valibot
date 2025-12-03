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

export function transformMerge(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  const secondSchema = args[0];
  const objectProperties: j.ObjectExpression['properties'] = [];

  // Handle first schema
  if (schemaExp.type === 'CallExpression' && isInlineObjectCall(schemaExp)) {
    // Inline the properties from the first schema
    const firstSchemaProperties = extractObjectProperties(schemaExp);
    objectProperties.push(...firstSchemaProperties);
  } else {
    // Use spread with .entries for schema reference
    const firstSchemaEntries = j.memberExpression(
      schemaExp,
      j.identifier('entries')
    );

    if (schemaExp.type === 'Identifier') {
      firstSchemaEntries.comments = [
        j.block(
          `@valibot-migrate we can't detect if ${schemaExp.name} has a \`pipe\` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline`,
          true,
          false
        ),
      ];
    }

    objectProperties.push(j.spreadElement(firstSchemaEntries));
  }

  // Handle second schema
  if (
    secondSchema.type === 'CallExpression' &&
    isInlineObjectCall(secondSchema)
  ) {
    // Inline the properties from the second schema
    const secondSchemaProperties = extractObjectProperties(
      secondSchema as j.CallExpression
    );
    objectProperties.push(...secondSchemaProperties);
    // this can technically never happen cause zod will yell at you if you spread the second element
  } else if (secondSchema.type !== 'SpreadElement') {
    // Use spread with .entries for schema reference
    const secondSchemaEntries = j.memberExpression(
      secondSchema,
      j.identifier('entries')
    );

    if (secondSchema.type === 'Identifier') {
      secondSchemaEntries.comments = [
        j.block(
          `@valibot-migrate we can't detect if ${secondSchema.name} has a \`pipe\` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline`,
          true,
          false
        ),
      ];
    }

    objectProperties.push(j.spreadElement(secondSchemaEntries));
  } else {
    const secondSchemaEntries = j.memberExpression(
      secondSchema.argument,
      j.identifier('entries')
    );
    objectProperties.push(j.spreadElement(secondSchemaEntries));
  }

  const mergedObject = j.objectExpression(objectProperties);

  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('object')),
    [mergedObject]
  );
}
