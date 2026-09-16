import type { ActionNode, MinLengthActionNode } from '../../types/index.ts';
import { generateEmailCode } from '../actions/generateEmailCode.ts';
import { generateMinLengthCode } from '../actions/generateMinLengthCode.ts';
import { indent } from '../utils/indent.ts';

/**
 * Generates the `~run` body for a standalone string schema (not inside an
 * object), optionally followed by pipe actions.
 *
 * @param v The valibot namespace binding.
 * @param actions Optional actions from a wrapping pipe.
 *
 * @returns The generated run body code.
 */
export function generateStringCode(
  v: string,
  actions?: readonly ActionNode[]
): string {
  const lines: string[] = [];
  lines.push(`if (typeof dataset.value === 'string') {`);
  lines.push(`  dataset.typed = true;`);

  if (actions) {
    for (const action of actions) {
      const actionCode = generateTopLevelActionCode(action, 'dataset.value', v);
      lines.push(indent(actionCode, 2));
    }
  }

  lines.push(`} else {`);
  lines.push(
    `  ${v}._addIssue({ kind: 'schema', type: 'string', reference: ${v}.string, expects: 'string' }, 'type', dataset, config);`
  );
  lines.push(`}`);
  lines.push(`return dataset;`);
  return lines.join('\n');
}

/**
 * Generates action code for top-level context (no object path).
 */
function generateTopLevelActionCode(
  action: ActionNode,
  varName: string,
  v: string
): string {
  switch (action.type) {
    case 'email':
      return generateEmailCode(varName, undefined, v);
    case 'minLength':
      return generateMinLengthCode(
        action as MinLengthActionNode,
        varName,
        undefined,
        v
      );
  }
}
