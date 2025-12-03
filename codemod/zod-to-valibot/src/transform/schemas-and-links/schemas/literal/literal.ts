import j from 'jscodeshift';
import { getSchemaComps, getSchemaWithOptionalDescription } from '../helpers';

export function transformLiteral(
  valibotIdentifier: string,
  args: j.CallExpression['arguments']
) {
  let schemaName: 'null' | 'undefined' | 'literal' = 'literal';
  let maxArgs = 2;
  // The `literal` schema has at least one argument
  // todo: find a way to check the assumption is correct and bail out if required
  const [valArg] = args;
  if (
    valArg.type === 'NullLiteral' ||
    (valArg.type === 'Identifier' && valArg.name === 'undefined')
  ) {
    args = args.slice(1);
    maxArgs = 1;
    schemaName = valArg.type === 'NullLiteral' ? 'null' : 'undefined';
  }
  const { baseSchema, description } = getSchemaComps(
    valibotIdentifier,
    schemaName,
    args,
    maxArgs
  );
  return getSchemaWithOptionalDescription(
    valibotIdentifier,
    baseSchema,
    description
  );
}
