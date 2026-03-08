import j from 'jscodeshift';
import {
  getDescription,
  getOptions,
  getSchemaComps,
  getSchemaWithOptionalDescription,
  getTransformedMsgs,
} from '../helpers';

export function transformBigint(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  coerceSchema: boolean
) {
  const { baseSchema, coerce, description } = getSchemaComps(
    valibotIdentifier,
    'bigint',
    args,
    1,
    coerceSchema
  );
  if (coerce) {
    const optionsArg =
      args.length > 0 && args[args.length - 1]?.type === 'ObjectExpression'
        ? args[args.length - 1]
        : null;
    const msgs = getTransformedMsgs(getOptions(optionsArg));
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
            j.identifier('toBigint')
          ),
          msgs.filter((m) => m !== null)
        ),
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
