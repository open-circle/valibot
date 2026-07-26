import j from 'jscodeshift';
import { getSchemaComps, getSchemaWithOptionalDescription } from '../helpers';

export function transformUndefined(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    'undefined',
    args,
    1
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
