import type { BaseIssue } from './issue.ts';
import type { ErrorMessage } from './other.ts';

/**
 * Config interface.
 */
export interface Config<TIssue extends BaseIssue<unknown>> {
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
  /**
   * The abort signal.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  readonly signal?: AbortSignal | undefined;
}
