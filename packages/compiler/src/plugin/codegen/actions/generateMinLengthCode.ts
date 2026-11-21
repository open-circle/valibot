import type { MinLengthActionNode } from '../../types/index.ts';

/**
 * Generates validation code for the `minLength` action.
 *
 * @param action The minLength action IR node.
 * @param varName The variable name holding the value.
 * @param pathItem The path item expression string, or `undefined` for top-level.
 * @param v The valibot namespace binding.
 *
 * @returns The generated validation code.
 */
export function generateMinLengthCode(
  action: MinLengthActionNode,
  varName: string,
  pathItem: string | undefined,
  v: string
): string {
  const req = action.requirement;
  const otherProps = pathItem
    ? `{ input: ${varName}, received: \`\${${varName}.length}\`, path: [${pathItem}] }`
    : `{ input: ${varName}, received: \`\${${varName}.length}\` }`;
  const lines: string[] = [];
  lines.push(`if (${varName}.length < ${req}) {`);
  lines.push(
    `  ${v}._addIssue({ kind: 'validation', type: 'min_length', reference: ${v}.minLength, expects: '>=${req}', requirement: ${req} }, 'length', dataset, config, ${otherProps});`
  );
  lines.push(
    `  if (config.abortEarly || config.abortPipeEarly) return dataset;`
  );
  lines.push(`}`);
  return lines.join('\n');
}
