import type {
  BaseIssue,
  BaseSchemaAsync,
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { createRecursive } from './_createRecursive.ts';
import {
  type RefAsync,
  type ResolveRecursiveInput,
  type ResolveRecursiveOutput,
} from './_recursive.ts';

/**
 * Recursive schema async interface.
 */
export interface RecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema = SyncOrAsyncSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchemaAsync<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'recursiveAsync';
  /**
   * The schema reference.
   */
  readonly reference: typeof recursiveAsync<SyncOrAsyncSchema>;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
}

type SyncOrAsyncSchema = GenericSchema | GenericSchemaAsync;
/**
 * Resolved recursive schema async interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema,
  TInputRoot = InferInput<TWrapped>,
  TOutputRoot = InferOutput<TWrapped>,
  TIssue extends BaseIssue<unknown> = InferIssue<TWrapped>,
> extends RecursiveSchemaAsync<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    TIssue
  > {}

/**
 * Creates a recursive schema.
 *
 * @param definition The schema definition. It runs once during construction.
 *
 * @returns A recursive schema.
 */
export function recursiveAsync<const TWrapped extends SyncOrAsyncSchema>(
  definition: (self: RefAsync) => TWrapped
): ResolvedRecursiveSchemaAsync<TWrapped>;
export function recursiveAsync(
  definition: (self: RefAsync) => SyncOrAsyncSchema
): unknown {
  return createRecursive({
    type: 'recursiveAsync',
    async: true,
    reference: recursiveAsync<SyncOrAsyncSchema>,
    build: definition,
  });
}
