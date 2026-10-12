import j from 'jscodeshift';
import { addToPipe } from '../../helpers.ts';

// `@__NO_SIDE_EFFECTS__`
/**
 * Adds a Valibot brand transformation to the schema pipe.
 */
export function transformBrand(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments']
) {
  return addToPipe(
    valibotIdentifier,
    schemaExp,
    j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('brand')
      ),
      args
    )
  );
}
