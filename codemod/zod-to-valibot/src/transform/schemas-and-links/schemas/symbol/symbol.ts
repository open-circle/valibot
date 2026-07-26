import j from 'jscodeshift';
import { getSchemaComps, getSchemaWithOptionalDescription } from '../helpers';

export function transformSymbol(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    'symbol',
    args,
    1
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
