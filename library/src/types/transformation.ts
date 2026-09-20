import type { Config } from './config.ts';
import type { OutputDataset, SuccessDataset } from './dataset.ts';
import type { BaseIssue } from './issue.ts';

/**
 * Base transformation interface.
 */
export interface BaseTransformation<
  TInput,
  TOutput,
  TIssue extends BaseIssue<unknown>,
> {
  /**
   * The object kind.
   */
  readonly kind: 'transformation';
  /**
   * The transformation type.
   */
  readonly type: string;
  /**
   * The transformation reference.
   */
  readonly reference: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => BaseTransformation<any, any, BaseIssue<unknown>>;
  /**
   * Whether it's async.
   */
  readonly async: false;
  /**
   * Transforms known input values.
   *
   * @param dataset The input dataset.
   * @param config The configuration.
   *
   * @returns The output dataset.
   *
   * @internal
   */
  readonly '~run': (
    dataset: SuccessDataset<TInput>,
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
 * Base transformation async interface.
 */
export interface BaseTransformationAsync<
  TInput,
  TOutput,
  TIssue extends BaseIssue<unknown>,
> extends Omit<
  BaseTransformation<TInput, TOutput, TIssue>,
  'reference' | 'async' | '~run'
> {
  /**
   * The transformation reference.
   */
  readonly reference: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | BaseTransformation<any, any, BaseIssue<unknown>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | BaseTransformationAsync<any, any, BaseIssue<unknown>>;
  /**
   * Whether it's async.
   */
  readonly async: true;
  /**
   * Transforms known input values.
   *
   * @param dataset The input dataset.
   * @param config The configuration.
   *
   * @returns The output dataset.
   *
   * @internal
   */
  readonly '~run': (
    dataset: SuccessDataset<TInput>,
    config: Config<BaseIssue<unknown>>
  ) => Promise<OutputDataset<TOutput, BaseIssue<unknown> | TIssue>>;
}

/**
 * Generic transformation type.
 */
export type GenericTransformation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = BaseTransformation<TInput, TOutput, TIssue>;

/**
 * Generic transformation async type.
 */
export type GenericTransformationAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = BaseTransformationAsync<TInput, TOutput, TIssue>;
