import type { BaseIssue } from '../../types/index.ts';

/**
 * Union issue interface.
 */
export interface UnionIssue<
  TSubIssue extends BaseIssue<unknown>,
> extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'union';
  /**
   * The expected property.
   */
  readonly expected: string;
  /**
   * The sub issues.
   */
  readonly issues?: [TSubIssue, ...TSubIssue[]];
}
