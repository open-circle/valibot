import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  NonOptional,
} from '../../types/index.ts';
import type {
  UnionIssue,
  UnionOptions,
  UnionOptionsAsync,
  UnionSchema,
  UnionSchemaAsync,
} from '../union/index.ts';

/**
 * Non optional issue interface.
 */
export interface NonOptionalIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'non_optional';
  /**
   * The expected property.
   */
  readonly expected: '!undefined';
}

/**
 * Infer non optional input type.
 */
export type InferNonOptionalInput<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = NonOptional<InferInput<TWrapped>>;

/**
 * Infer non optional output type.
 */
export type InferNonOptionalOutput<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = NonOptional<InferOutput<TWrapped>>;

/**
 * Infer non optional issue type.
 */
export type InferNonOptionalIssue<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TWrapped extends
  | UnionSchema<
      UnionOptions,
      ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined
    >
  | UnionSchemaAsync<
      UnionOptionsAsync,
      ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined
    >
  ? | Exclude<InferIssue<TWrapped>, { type: 'undefined' | 'union' }>
    | UnionIssue<InferNonOptionalIssue<TWrapped['options'][number]>>
  : Exclude<InferIssue<TWrapped>, { type: 'undefined' }>;
