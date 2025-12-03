import j from 'jscodeshift';
import {
  getDescription,
  getSchemaComps,
  getSchemaWithOptionalDescription,
} from '../helpers';

export function transformString(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  coerceSchema: boolean
) {
  const { baseSchema, coerce, description } = getSchemaComps(
    valibotIdentifier,
    'string',
    args,
    1,
    coerceSchema
  );
  if (coerce) {
    return j.callExpression(
      j.memberExpression(j.identifier(valibotIdentifier), j.identifier('pipe')),
      [
        j.callExpression(
          j.memberExpression(
            j.identifier(valibotIdentifier),
            j.identifier('unknown')
          ),
          []
        ),
        j.callExpression(
          j.memberExpression(
            j.identifier(valibotIdentifier),
            j.identifier('transform')
          ),
          [j.identifier('String')]
        ),
        baseSchema,
        ...(description
          ? [getDescription(valibotIdentifier, description)]
          : []),
      ]
    );
  }
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
