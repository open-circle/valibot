import type { BaseIssue } from './issue.ts';
import type { BaseMetadata } from './metadata.ts';
import type { BaseSchema, BaseSchemaAsync } from './schema.ts';
import type {
  BaseTransformation,
  BaseTransformationAsync,
} from './transformation.ts';
import type { BaseValidation, BaseValidationAsync } from './validation.ts';

/**
 * Pipe action type.
 */
export type PipeAction<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
  | BaseValidation<TInput, TOutput, TIssue>
  | BaseTransformation<TInput, TOutput, TIssue>
  | BaseMetadata<TInput>;

/**
 * Pipe action async type.
 */
export type PipeActionAsync<
  TInput,
  TOutput,
  TIssue extends BaseIssue<unknown>,
> =
  | BaseValidationAsync<TInput, TOutput, TIssue>
  | BaseTransformationAsync<TInput, TOutput, TIssue>;

/**
 * Pipe item type.
 */
export type PipeItem<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
  BaseSchema<TInput, TOutput, TIssue> | PipeAction<TInput, TOutput, TIssue>;

/**
 * Pipe item async type.
 */
export type PipeItemAsync<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
  | BaseSchemaAsync<TInput, TOutput, TIssue>
  | PipeActionAsync<TInput, TOutput, TIssue>;

/**
 * Schema without pipe type.
 */
export type SchemaWithoutPipe<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TSchema & { pipe?: never };

/**
 * Generic pipe action type.
 */
export type GenericPipeAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = PipeAction<TInput, TOutput, TIssue>;

/**
 * Generic pipe action async type.
 */
export type GenericPipeActionAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = PipeActionAsync<TInput, TOutput, TIssue>;

/**
 * Generic pipe item type.
 */
export type GenericPipeItem<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = PipeItem<TInput, TOutput, TIssue>;

/**
 * Generic pipe item async type.
 */
export type GenericPipeItemAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput = any,
  TOutput = TInput,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> = PipeItemAsync<TInput, TOutput, TIssue>;
