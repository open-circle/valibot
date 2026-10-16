import type { CallExpression } from 'oxc-parser';
import type { SchemaNode } from '../../types/index.ts';
import { extractStringMessage } from '../utils/index.ts';

/**
 * Analyzes `v.string()` or `v.string(message)`.
 *
 * @param call The call expression for `v.string(...)`.
 *
 * @returns The schema IR node, or `null` if not statically analyzable.
 */
export function analyzeStringSchema(call: CallExpression): SchemaNode | null {
  if (call.arguments.length > 1) return null;
  const message = extractStringMessage(call, 0);
  return { kind: 'schema', type: 'string', message };
}
