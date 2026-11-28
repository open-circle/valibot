import type { BaseIssue } from './issue.ts';
import type { ErrorMessage } from './other.ts';

/**
 * Config interface.
 *
 * Hint: The explicit variance annotations of the generics spare TypeScript
 * from measuring the variance of this interface (see issue #1663).
 */
export interface Config<in TIssue extends BaseIssue<unknown>> {
  /**
   * The selected language.
   */
  readonly lang?: string | undefined;
  /**
   * The error message.
   */
  readonly message?: ErrorMessage<TIssue> | undefined;
  /**
   * Whether it should be aborted early.
   */
  readonly abortEarly?: boolean | undefined;
  /**
   * Whether a pipe should be aborted early.
   */
  readonly abortPipeEarly?: boolean | undefined;
}
