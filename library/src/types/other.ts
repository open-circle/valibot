import type { Config } from './config.ts';
import type { UnknownDataset } from './dataset.ts';
import type { InferInput, InferIssue } from './infer.ts';
import type { BaseIssue } from './issue.ts';
import type { BaseSchema, BaseSchemaAsync } from './schema.ts';
import type { MaybeDeepReadonly, MaybePromise } from './utils.ts';

/**
 * Error message type.
 */
export type ErrorMessage<TIssue extends BaseIssue<unknown>> =
  | ((issue: TIssue) => string)
  | string;

/**
 * Default type.
 */
export type Default<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TInput extends null | undefined,
> =
  | MaybeDeepReadonly<InferInput<TWrapped> | TInput>
  | ((
      dataset?: UnknownDataset,
      config?: Config<InferIssue<TWrapped>>
    ) => MaybeDeepReadonly<InferInput<TWrapped> | TInput>)
  | undefined;

/**
 * Default async type.
 */
export type DefaultAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TInput extends null | undefined,
> =
  | MaybeDeepReadonly<InferInput<TWrapped> | TInput>
  | ((
      dataset?: UnknownDataset,
      config?: Config<InferIssue<TWrapped>>
    ) => MaybePromise<MaybeDeepReadonly<InferInput<TWrapped> | TInput>>)
  | undefined;

/**
 * Default value type.
 */
export type DefaultValue<
  TDefault extends
    | Default<
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        null | undefined
      >
    | DefaultAsync<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        null | undefined
      >,
> =
  TDefault extends DefaultAsync<
    infer TWrapped extends
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
    infer TInput
  >
    ? TDefault extends (
        dataset?: UnknownDataset,
        config?: Config<InferIssue<TWrapped>>
      ) => MaybePromise<MaybeDeepReadonly<InferInput<TWrapped> | TInput>>
      ? Awaited<ReturnType<TDefault>>
      : TDefault
    : never;
