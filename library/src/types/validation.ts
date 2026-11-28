import type { Config } from './config.ts';
import type { OutputDataset } from './dataset.ts';
import type { BaseIssue } from './issue.ts';

/**
 * Base validation interface.
 *
 * Hint: The explicit variance annotations of the generics spare TypeScript
 * from measuring the variance of this interface (see issue #1663). `TInput`
 * is invariant, because it is consumed by `~run` and exposed by `~types`.
 */
export interface BaseValidation<
  in out TInput,
  out TOutput,
  out TIssue extends BaseIssue<unknown>,
> {
  /**
   * The object kind.
   */
  readonly kind: 'validation';
  /**
   * The validation type.
   */
  readonly type: string;
  /**
   * The validation reference.
   */
  readonly reference: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => BaseValidation<any, any, BaseIssue<unknown>>;
  /**
   * The expected property.
   */
  readonly expects: string | null;
  /**
   * Whether it's async.
   */
  readonly async: false;
  /**
   * Validates known input values.
   *
   * @param dataset The input dataset.
   * @param config The configuration.
   *
   * @returns The output dataset.
   *
   * @internal
   */
  readonly '~run': (
    dataset: OutputDataset<TInput, BaseIssue<unknown>>,
    config: Config<BaseIssue<unknown>>
  ) => OutputDataset<TOutput, BaseIssue<unknown> | TIssue>;
  /**
   * The input, output and issue type.
   *
   * @internal
   */
  readonly '~types'?:
    | {
        readonly input: TInput;
        readonly output: TOutput;
        readonly issue: TIssue;
      }
    | undefined;
}

/**
 * Base validation async interface.
 *
 * Hint: The explicit variance annotations of the generics spare TypeScript
 * from measuring the variance of this interface (see issue #1663). `TInput`
 * is invariant, because it is consumed by `~run` and exposed by `~types`.
 */
export interface BaseValidationAsync<
  in out TInput,
  out TOutput,
  out TIssue extends BaseIssue<unknown>,
> extends Omit<
    BaseValidation<TInput, TOutput, TIssue>,
    'reference' | 'async' | '~run'
  > {
  /**
   * The validation reference.
   */
  readonly reference: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | BaseValidation<any, any, BaseIssue<unknown>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | BaseValidationAsync<any, any, BaseIssue<unknown>>;
  /**
   * Whether it's async.
   */
  readonly async: true;
  /**
   * Validates known input values.
   *
   * @param dataset The input dataset.
   * @param config The configuration.
   *
   * @returns The output dataset.
   *
   * @internal
   */
  readonly '~run': (
    dataset: OutputDataset<TInput, BaseIssue<unknown>>,
    config: Config<BaseIssue<unknown>>
  ) => Promise<OutputDataset<TOutput, BaseIssue<unknown> | TIssue>>;
}

/**
 * Generic validation type.
 */
export type GenericValidation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = BaseValidation<TInput, TOutput, TIssue>;

/**
 * Generic validation async type.
 */
export type GenericValidationAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = BaseValidationAsync<TInput, TOutput, TIssue>;
