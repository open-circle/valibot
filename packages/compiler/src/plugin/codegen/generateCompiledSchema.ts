import type { ActionNode, PipeNode, SchemaNode } from '../types/index.ts';
import { generateObjectCode } from './schemas/generateObjectCode.ts';
import { generateStringCode } from './schemas/generateStringCode.ts';
import { indent } from './utils/indent.ts';

/**
 * Generates a full compiled schema object literal from a schema IR node.
 *
 * @param node The root schema IR node.
 * @param v The valibot namespace binding (e.g., `'v'`).
 * @param compiledRef The `compiled` function binding name.
 * @param originalSchemaSource The original schema argument source text.
 *
 * @returns The generated schema object literal as a string.
 */
export function generateCompiledSchema(
  node: SchemaNode,
  v: string,
  compiledRef: string,
  originalSchemaSource: string
): string {
  const expects = getExpects(node);
  const runBody = generateRunBody(node, v);

  return [
    `({`,
    `  kind: 'schema',`,
    `  type: 'compiled',`,
    `  reference: ${compiledRef},`,
    `  expects: ${JSON.stringify(expects)},`,
    `  async: false,`,
    `  schema: ${originalSchemaSource},`,
    `  get '~standard'() { return ${v}._getStandardProps(this); },`,
    `  '~run'(dataset, config) {`,
    indent(runBody, 4),
    `  },`,
    `})`,
  ].join('\n');
}

/**
 * Gets the `expects` string for the outermost schema.
 */
function getExpects(node: SchemaNode): string {
  switch (node.kind) {
    case 'schema':
      return node.type === 'object' ? 'Object' : 'string';
    case 'pipe':
      return getExpects(node.schema);
  }
}

/**
 * Generates the body of the optimized `~run` method.
 */
function generateRunBody(
  node: SchemaNode,
  v: string,
  actions?: readonly ActionNode[]
): string {
  switch (node.kind) {
    case 'schema':
      if (node.type === 'object') {
        return generateObjectCode(node, v);
      }
      return generateStringCode(v, actions);
    case 'pipe':
      return generatePipeRunBody(node, v);
  }
}

/**
 * Generates run body for a pipe at the top level, passing actions through
 * to the inner schema's code generator.
 */
function generatePipeRunBody(node: PipeNode, v: string): string {
  return generateRunBody(node.schema, v, node.actions);
}
