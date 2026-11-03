import type { OutputDataset, UnknownDataset } from './dataset.ts';
import type { BaseIssue } from './issue.ts';
import type { ErrorMessage } from './other.ts';
import type { PipeItem, PipeItemAsync } from './pipe.ts';

/**
 * Config interface.
 */
export interface Config<TIssue extends BaseIssue<unknown>> {
  /**
   * The internal execution direction. Defaults to decoding.
   *
   * @internal
   */
  readonly '~direction'?: 'encode' | 'decode' | undefined;
  /**
   * Whether to check decoded types without conversions or pipeline checks.
   *
   * @internal
   */
  readonly '~typeCheckOnly'?: boolean | undefined;
  /**
   * The synchronous reverse pipeline runner, supplied only during encoding.
   *
   * @internal
   */
  readonly '~runPipe'?:
    | ((
        pipe: readonly PipeItem<unknown, unknown, BaseIssue<unknown>>[],
        dataset: UnknownDataset,
        config: Config<BaseIssue<unknown>>
      ) => OutputDataset<unknown, BaseIssue<unknown>>)
    | undefined;
  /**
   * The asynchronous reverse pipeline runner, supplied only during encoding.
   *
   * @internal
   */
  readonly '~runPipeAsync'?:
    | ((
        pipe: readonly (
          | PipeItem<unknown, unknown, BaseIssue<unknown>>
          | PipeItemAsync<unknown, unknown, BaseIssue<unknown>>
        )[],
        dataset: UnknownDataset,
        config: Config<BaseIssue<unknown>>
      ) => Promise<OutputDataset<unknown, BaseIssue<unknown>>>)
    | undefined;

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
