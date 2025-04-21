import type { BaseIssue } from '../../types/index.ts';

export interface ObjectWithPatternsIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'object_with_patterns';
  /**
   * The expected property.
   */
  readonly expected: 'Object' | `"${string}"`;
}
