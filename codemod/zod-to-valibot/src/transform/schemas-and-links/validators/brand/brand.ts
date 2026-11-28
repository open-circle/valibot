import j from 'jscodeshift';

export function transformBrand(
  valibotIdentifier: string,
  args: j.CallExpression['arguments'],
  // no type definition found
  typeParameters: any
) {
  // Zod usually receives the brand as type argument (`.brand<"Name">()`),
  // while Valibot expects it as value. If it is a string or number literal,
  // we therefore pass it as argument.
  const typeParameter = typeParameters?.params?.[0];
  const brandArgs =
    args.length === 0 &&
    typeParameter?.type === 'TSLiteralType' &&
    (typeParameter.literal.type === 'StringLiteral' ||
      typeParameter.literal.type === 'NumericLiteral')
      ? [typeParameter.literal]
      : args;
  return j.callExpression(
    j.memberExpression(j.identifier(valibotIdentifier), j.identifier('brand')),
    brandArgs
  );
}
