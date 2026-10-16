/**
 * Generates validation code for the `email` action.
 *
 * @param varName The variable name holding the value.
 * @param pathItem The path item expression string, or `undefined` for top-level.
 * @param v The valibot namespace binding.
 *
 * @returns The generated validation code.
 */
export function generateEmailCode(
  varName: string,
  pathItem: string | undefined,
  v: string
): string {
  const otherProps = pathItem
    ? `{ input: ${varName}, path: [${pathItem}] }`
    : `{ input: ${varName} }`;
  const lines: string[] = [];
  lines.push(`if (!${v}.EMAIL_REGEX.test(${varName})) {`);
  lines.push(
    `  ${v}._addIssue({ kind: 'validation', type: 'email', reference: ${v}.email, expects: null, requirement: ${v}.EMAIL_REGEX }, 'email', dataset, config, ${otherProps});`
  );
  lines.push(
    `  if (config.abortEarly || config.abortPipeEarly) return dataset;`
  );
  lines.push(`}`);
  return lines.join('\n');
}
