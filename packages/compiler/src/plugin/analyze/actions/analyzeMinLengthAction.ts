import type { CallExpression } from 'oxc-parser';
import type { ActionNode } from '../../types/index.ts';
import { extractStringMessage } from '../utils/index.ts';

/**
 * Analyzes `v.minLength(requirement)` or `v.minLength(requirement, message)`.
 *
 * @param call The call expression for `v.minLength(...)`.
 *
 * @returns The action IR node, or `null` if not statically analyzable.
 */
export function analyzeMinLengthAction(
  call: CallExpression
): ActionNode | null {
  if (call.arguments.length < 1 || call.arguments.length > 2) return null;

  const reqArg = call.arguments[0];
  if (
    !reqArg ||
    reqArg.type === 'SpreadElement' ||
    (reqArg as { type: string }).type !== 'Literal'
  ) {
    return null;
  }

  const literal = reqArg as { type: string; value: unknown };
  if (typeof literal.value !== 'number') return null;

  const requirement = literal.value;
  const message = extractStringMessage(call, 1);

  return { kind: 'action', type: 'minLength', requirement, message };
}
