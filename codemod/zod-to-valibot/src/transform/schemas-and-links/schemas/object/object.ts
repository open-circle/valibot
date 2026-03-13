import j from 'jscodeshift';
import { ObjectModifier } from '../../types';
import { getSchemaComps, getSchemaWithOptionalDescription } from '../helpers';

export function transformObject(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  modifier: ObjectModifier = null
) {
  let schemaName = 'object';
  if (modifier === 'strict') {
    schemaName = 'strictObject';
  } else if (modifier === 'passthrough') {
    schemaName = 'looseObject';
  }

  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    schemaName,
    args,
    2
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
