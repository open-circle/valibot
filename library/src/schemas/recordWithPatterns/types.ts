import type { BaseIssue } from '../../types/index.ts';

export interface RecordWithPatternsIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'record_with_patterns';
  /**
   * The expected property.
   */
  readonly expected: 'Object' | `"${string}"`;
}
