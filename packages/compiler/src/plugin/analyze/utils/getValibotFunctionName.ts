import type { CallExpression, Expression } from 'oxc-parser';

/**
 * Extracts the function name from `v.something(...)` member expressions.
 *
 * @param call The call expression to inspect.
 * @param vBinding The valibot namespace binding name.
 *
 * @returns The function name, or `null` if not a valibot member call.
 */
export function getValibotFunctionName(
  call: CallExpression,
  vBinding: string
): string | null {
  if (call.callee.type !== 'MemberExpression') return null;
  const member = call.callee as {
    type: string;
    object: Expression;
    property: { name?: string };
    computed: boolean;
  };
  if (member.computed) return null;
  if (member.object.type !== 'Identifier') return null;
  if ((member.object as { name: string }).name !== vBinding) return null;
  return member.property.name ?? null;
}
