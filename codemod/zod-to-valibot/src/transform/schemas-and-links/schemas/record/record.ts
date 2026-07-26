import j from 'jscodeshift';
import {
  getSchemaComps,
  getSchemaWithOptionalDescription,
} from '../../schemas/helpers';

export function transformRecord(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    'record',
    args.length === 1 ||
      (args.length === 2 && args[1].type === 'ObjectExpression')
      ? [
          j.callExpression(
            j.memberExpression(
              j.identifier(valibotIdentifier),
              j.identifier('string')
            ),
            []
          ),
          ...args,
        ]
      : args,
    3
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
