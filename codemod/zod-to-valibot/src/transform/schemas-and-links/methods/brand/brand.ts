import j from 'jscodeshift';
import { addToPipe } from '../../helpers.ts';

function getBrandNameFromTypeParameters(
  typeParameters: j.TSTypeParameterInstantiation | null | undefined
): j.Literal | null {
  const firstParam = typeParameters?.params[0];
  if (firstParam?.type !== 'TSLiteralType') {
    return null;
  }

  const literal = firstParam.literal;
  if (literal.type === 'StringLiteral' || literal.type === 'Literal') {
    return typeof literal.value === 'string' ? j.literal(literal.value) : null;
  }

  return null;
}

/**
 * Transforms Zod brand calls into Valibot brand pipe actions.
 */
// @__NO_SIDE_EFFECTS__
export function transformBrand(
  valibotIdentifier: string,
  schemaExp: j.CallExpression | j.MemberExpression | j.Identifier,
  args: j.CallExpression['arguments'],
  typeParameters?: j.TSTypeParameterInstantiation | null
) {
  const brandArgs =
    args.length > 0 ? args : [getBrandNameFromTypeParameters(typeParameters)].filter(Boolean);
  return addToPipe(
    valibotIdentifier,
    schemaExp,
    j.callExpression(
      j.memberExpression(
        j.identifier(valibotIdentifier),
        j.identifier('brand')
      ),
      brandArgs
    )
  );
}
