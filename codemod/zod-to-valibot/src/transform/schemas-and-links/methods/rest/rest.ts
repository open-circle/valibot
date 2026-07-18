import j from 'jscodeshift';
import { addToPipe } from '../../helpers';

export function transformRest(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  if (
    schemaExp.type === 'CallExpression' &&
    schemaExp.callee.type === 'MemberExpression' &&
    schemaExp.callee.object.type === 'Identifier' &&
    schemaExp.callee.object.name === valibotIdentifier &&
    schemaExp.callee.property.type === 'Identifier' &&
    schemaExp.callee.property.name === 'tuple'
  ) {
    return j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('tupleWithRest')
      ),
      [schemaExp.arguments[0], ...args, ...schemaExp.arguments.slice(1)]
    );
  }
  return addToPipe(
    valibotIdentifier,
    schemaExp,
    j.callExpression(
      j.memberExpression(j.identifier(valibotIdentifier), j.identifier('rest')),
      args
    )
  );
}
