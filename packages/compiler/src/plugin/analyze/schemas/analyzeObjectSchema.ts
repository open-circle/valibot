import type { CallExpression, Expression } from 'oxc-parser';
import type { SchemaNode } from '../../types/index.ts';
import { analyzeExpression } from '../analyzeCode.ts';
import { extractStringMessage } from '../utils/index.ts';

/**
 * Analyzes `v.object({ key: schema, ... })`.
 *
 * @param call The call expression for `v.object(...)`.
 * @param vBinding The valibot namespace binding name.
 *
 * @returns The schema IR node, or `null` if not statically analyzable.
 */
export function analyzeObjectSchema(
  call: CallExpression,
  vBinding: string
): SchemaNode | null {
  if (call.arguments.length < 1 || call.arguments.length > 2) return null;
  const entriesArg = call.arguments[0];
  if (!entriesArg || entriesArg.type !== 'ObjectExpression') return null;

  const objExpr = entriesArg as {
    type: string;
    properties: Array<{
      type: string;
      key: { type: string; name?: string; value?: string };
      value: Expression;
      computed: boolean;
      kind: string;
    }>;
  };

  const entries: Record<string, SchemaNode> = {};

  for (const prop of objExpr.properties) {
    if (prop.type !== 'Property') return null;
    if (prop.computed) return null;

    const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
    if (!key) return null;

    const valueNode = analyzeExpression(prop.value, vBinding);
    if (!valueNode) return null;

    entries[key] = valueNode;
  }

  const message = extractStringMessage(call, 1);

  return { kind: 'schema', type: 'object', entries, message };
}
