import j from 'jscodeshift';
import { addToPipe } from '../../helpers';

export function transformStrict(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier
) {
  // If the schema is already a strictObject, return it as-is (no-op)
  if (
    schemaExp.type === 'CallExpression' &&
    schemaExp.callee.type === 'MemberExpression' &&
    schemaExp.callee.object.type === 'Identifier' &&
    schemaExp.callee.object.name === valibotIdentifier &&
    schemaExp.callee.property.type === 'Identifier' &&
    schemaExp.callee.property.name === 'strictObject'
  ) {
    return schemaExp;
  }

  // If the schema is a pipe with strictObject, return it as-is (no-op)
  if (
    schemaExp.type === 'CallExpression' &&
    schemaExp.callee.type === 'MemberExpression' &&
    schemaExp.callee.object.type === 'Identifier' &&
    schemaExp.callee.object.name === valibotIdentifier &&
    schemaExp.callee.property.type === 'Identifier' &&
    schemaExp.callee.property.name === 'pipe' &&
    schemaExp.arguments.length > 0 &&
    schemaExp.arguments[0].type === 'CallExpression' &&
    schemaExp.arguments[0].callee.type === 'MemberExpression' &&
    schemaExp.arguments[0].callee.object.type === 'Identifier' &&
    schemaExp.arguments[0].callee.object.name === valibotIdentifier &&
    schemaExp.arguments[0].callee.property.type === 'Identifier' &&
    schemaExp.arguments[0].callee.property.name === 'strictObject'
  ) {
    return schemaExp;
  }

  // Transform regular object to strictObject
  if (
    schemaExp.type === 'CallExpression' &&
    schemaExp.callee.type === 'MemberExpression' &&
    schemaExp.callee.object.type === 'Identifier' &&
    schemaExp.callee.object.name === valibotIdentifier &&
    schemaExp.callee.property.type === 'Identifier' &&
    schemaExp.callee.property.name === 'object'
  ) {
    return j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('strictObject')
      ),
      schemaExp.arguments
    );
  }

  const entries = j.memberExpression(schemaExp, j.identifier('entries'));

  if (schemaExp.type === 'Identifier') {
    entries.comments = [
      j.block(
        `@valibot-migrate we can't detect if ${schemaExp.name} has a \`pipe\` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline`,
        true,
        false
      ),
    ];
  }

  // Handle other cases (like previously defined schemas)
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('strictObject')
    ),
    [entries]
  );
}
