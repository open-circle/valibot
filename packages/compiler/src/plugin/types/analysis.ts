import type { SchemaNode } from './nodes.ts';

/**
 * Result of analyzing a single `compiled(...)` call expression.
 */
export interface AnalyzedCall {
  /** Start offset of the `compiled(...)` call expression in the source. */
  readonly start: number;
  /** End offset of the `compiled(...)` call expression in the source. */
  readonly end: number;
  /** The analyzed schema IR. */
  readonly node: SchemaNode;
  /** The valibot namespace binding name (e.g., `'v'`). */
  readonly valibotBinding: string;
  /** The `compiled` function binding name. */
  readonly compiledBinding: string;
  /** Start offset of the schema argument (inside `compiled(...)`). */
  readonly schemaArgStart: number;
  /** End offset of the schema argument. */
  readonly schemaArgEnd: number;
}
