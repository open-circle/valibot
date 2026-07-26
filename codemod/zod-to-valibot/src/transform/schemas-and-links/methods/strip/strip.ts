import j from 'jscodeshift';
import { addToPipe } from '../../helpers';

export function transformStrip(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier
) {
  if (
    schemaExp.type === 'CallExpression' &&
    schemaExp.callee.type === 'MemberExpression' &&
    schemaExp.callee.object.type === 'Identifier' &&
    schemaExp.callee.object.name === valibotIdentifier &&
    schemaExp.callee.property.type === 'Identifier' &&
    (schemaExp.callee.property.name === 'looseObject' ||
      schemaExp.callee.property.name === 'strictObject')
  ) {
    return j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('object')
      ),
      schemaExp.arguments
    );
  }
  return addToPipe(
    valibotIdentifier,
    schemaExp,
    j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('strip')
      ),
      []
    )
  );
}
