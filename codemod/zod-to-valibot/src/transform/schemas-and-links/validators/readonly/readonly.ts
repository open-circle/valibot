import j from 'jscodeshift';

export function transformReadonly(valibotIdentifier: string) {
  return j.callExpression(
    j.memberExpression(
      j.identifier(valibotIdentifier),
      j.identifier('readonly')
    ),
    []
  );
}
