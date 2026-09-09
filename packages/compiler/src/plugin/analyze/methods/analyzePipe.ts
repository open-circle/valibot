import type { CallExpression, Expression } from 'oxc-parser';
import type { ActionNode, SchemaNode } from '../../types/index.ts';
import { analyzeEmailAction } from '../actions/analyzeEmailAction.ts';
import { analyzeMinLengthAction } from '../actions/analyzeMinLengthAction.ts';
import { analyzeExpression } from '../analyzeCode.ts';
import { getValibotFunctionName } from '../utils/index.ts';

/**
 * Analyzes `v.pipe(schema, ...actions)`.
 *
 * @param call The call expression for `v.pipe(...)`.
 * @param vBinding The valibot namespace binding name.
 *
 * @returns The schema IR node, or `null` if not statically analyzable.
 */
export function analyzePipe(
  call: CallExpression,
  vBinding: string
): SchemaNode | null {
  if (call.arguments.length < 1) return null;

  const schemaArg = call.arguments[0];
  if (!schemaArg || schemaArg.type === 'SpreadElement') return null;

  const schema = analyzeExpression(schemaArg as Expression, vBinding);
  if (!schema) return null;

  const actions: ActionNode[] = [];
  for (let i = 1; i < call.arguments.length; i++) {
    const actionArg = call.arguments[i];
    if (!actionArg || actionArg.type === 'SpreadElement') return null;
    const action = analyzeAction(actionArg as Expression, vBinding);
    if (!action) return null;
    actions.push(action);
  }

  return { kind: 'pipe', schema, actions };
}

/**
 * Analyzes an action expression (e.g., `v.email()`, `v.minLength(8)`).
 */
function analyzeAction(expr: Expression, vBinding: string): ActionNode | null {
  if (expr.type !== 'CallExpression') return null;
  const call = expr as CallExpression;

  const fnName = getValibotFunctionName(call, vBinding);
  if (!fnName) return null;

  switch (fnName) {
    case 'email':
      return analyzeEmailAction(call);
    case 'minLength':
      return analyzeMinLengthAction(call);
    default:
      return null;
  }
}
