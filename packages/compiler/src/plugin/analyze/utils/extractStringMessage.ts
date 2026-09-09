import type { CallExpression } from 'oxc-parser';

/**
 * Extracts a string literal message argument from a call, if present.
 *
 * @param call The call expression.
 * @param index The argument index to extract from.
 *
 * @returns The string value, or `undefined` if not a string literal.
 */
export function extractStringMessage(
  call: CallExpression,
  index: number
): string | undefined {
  const arg = call.arguments[index];
  if (!arg || arg.type === 'SpreadElement') return undefined;
  const expr = arg as { type: string; value?: unknown };
  if (expr.type !== 'Literal' || typeof expr.value !== 'string') {
    return undefined;
  }
  return expr.value;
}
