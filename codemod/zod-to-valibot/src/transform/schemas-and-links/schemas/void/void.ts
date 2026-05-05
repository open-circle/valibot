import j from 'jscodeshift';
import { getSchemaComps, getSchemaWithOptionalDescription } from '../helpers';

export function transformVoid(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    'void',
    args,
    1
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
