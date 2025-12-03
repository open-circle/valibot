import j from 'jscodeshift';
import {
  getDescription,
  getSchemaComps,
  getSchemaWithOptionalDescription,
} from '../helpers';

export function transformBoolean(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  coerceSchema: boolean
) {
  const { baseSchema, coerce, description } = getSchemaComps(
    valibotIdentifier,
    'boolean',
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
          [j.identifier('Boolean')]
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
