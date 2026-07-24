import type {
  ActionNode,
  MinLengthActionNode,
  ObjectSchemaNode,
  SchemaNode,
} from '../../types/index.ts';
import { generateEmailCode } from '../actions/generateEmailCode.ts';
import { generateMinLengthCode } from '../actions/generateMinLengthCode.ts';
import { indent } from '../utils/indent.ts';

/**
 * Generates the `~run` body for an object schema at the top level.
 *
 * @param node The object schema IR node.
 * @param v The valibot namespace binding.
 *
 * @returns The generated run body code.
 */
export function generateObjectCode(node: ObjectSchemaNode, v: string): string {
  const lines: string[] = [];
  lines.push(`const input = dataset.value;`);
  lines.push(`if (input && typeof input === 'object') {`);
  lines.push(`  dataset.typed = true;`);
  lines.push(`  dataset.value = {};`);

  const keys = Object.keys(node.entries);
  for (let i = 0; i < keys.length; i++) {
    lines.push(``);
    const key = keys[i];
    const entryNode = node.entries[key];
    const entryCode = generateEntryCode(key, i, entryNode, v);
    lines.push(indent(entryCode, 2));
  }

  lines.push(`} else {`);
  lines.push(
    `  ${v}._addIssue({ kind: 'schema', type: 'object', reference: ${v}.object, expects: 'Object' }, 'type', dataset, config);`
  );
  lines.push(`}`);
  lines.push(`return dataset;`);

  return lines.join('\n');
}

/**
 * Generates code for a single object entry (property validation).
 */
function generateEntryCode(
  key: string,
  index: number,
  node: SchemaNode,
  v: string
): string {
  const varName = `v${index}$`;
  const keyStr = JSON.stringify(key);
  const lines: string[] = [];

  // Unwrap pipe to get the schema and actions
  let schema: SchemaNode;
  let actions: readonly ActionNode[];
  if (node.kind === 'pipe') {
    schema = node.schema;
    actions = node.actions;
  } else {
    schema = node;
    actions = [];
  }

  const pathItem = `{ type: 'object', origin: 'value', input, key: ${keyStr}, value: ${varName} }`;
  const keyPathItem = `{ type: 'object', origin: 'key', input, key: ${keyStr}, value: undefined }`;

  lines.push(`if (${keyStr} in input) {`);
  lines.push(`  const ${varName} = input[${keyStr}];`);

  // Generate type check based on schema type
  if (schema.kind === 'schema' && schema.type === 'string') {
    lines.push(`  if (typeof ${varName} === 'string') {`);
    lines.push(`    dataset.value[${keyStr}] = ${varName};`);

    // Generate action validations
    for (let i = 0; i < actions.length; i++) {
      const actionCode = generateActionCode(actions[i], varName, key, v);
      lines.push(indent(actionCode, 4));
    }

    lines.push(`  } else {`);
    lines.push(
      `    ${v}._addIssue({ kind: 'schema', type: 'string', reference: ${v}.string, expects: 'string' }, 'type', dataset, config, { input: ${varName}, path: [${pathItem}] });`
    );
    lines.push(`    if (config.abortEarly) return dataset;`);
    lines.push(`  }`);
  }

  lines.push(`} else {`);
  lines.push(
    `  ${v}._addIssue({ kind: 'schema', type: 'object', reference: ${v}.object, expects: 'Object' }, 'key', dataset, config, { input: undefined, expected: ${JSON.stringify(`"${key}"`)}, path: [${keyPathItem}] });`
  );
  lines.push(`  if (config.abortEarly) return dataset;`);
  lines.push(`}`);

  return lines.join('\n');
}

/**
 * Generates validation code for a single action within a pipe.
 */
function generateActionCode(
  action: ActionNode,
  varName: string,
  key: string,
  v: string
): string {
  const keyStr = JSON.stringify(key);
  const pathItem = `{ type: 'object', origin: 'value', input, key: ${keyStr}, value: ${varName} }`;

  switch (action.type) {
    case 'email':
      return generateEmailCode(varName, pathItem, v);
    case 'minLength':
      return generateMinLengthCode(
        action as MinLengthActionNode,
        varName,
        pathItem,
        v
      );
  }
}
