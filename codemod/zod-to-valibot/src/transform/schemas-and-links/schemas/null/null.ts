import j from 'jscodeshift';
import { getSchemaComps, getSchemaWithOptionalDescription } from '../helpers';

export function transformNull(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    'null',
    args,
    1
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
