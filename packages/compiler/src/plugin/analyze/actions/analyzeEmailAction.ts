import type { CallExpression } from 'oxc-parser';
import type { ActionNode } from '../../types/index.ts';
import { extractStringMessage } from '../utils/index.ts';

/**
 * Analyzes `v.email()` or `v.email(message)`.
 *
 * @param call The call expression for `v.email(...)`.
 *
 * @returns The action IR node, or `null` if not statically analyzable.
 */
export function analyzeEmailAction(call: CallExpression): ActionNode | null {
  if (call.arguments.length > 1) return null;
  const message = extractStringMessage(call, 0);
  return { kind: 'action', type: 'email', message };
}
