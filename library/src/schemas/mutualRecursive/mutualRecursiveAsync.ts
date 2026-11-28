import type {
  BaseIssue,
  BaseSchemaAsync,
  GenericSchema,
  GenericSchemaAsync,
} from '../../types/index.ts';
import { createRecursive } from '../recursive/_createRecursive.ts';
import { createRecursiveSchema } from '../recursive/_recursive.ts';
import {
  type CheckReferences,
  createMutualRecursive,
  type RecursiveSchemasAsync,
  type RefFactoryAsync,
} from './_mutualRecursive.ts';

/**
 * Mutual recursive schema async interface.
 */
export interface MutualRecursiveSchemaAsync<
  TWrapped extends SyncOrAsyncSchema = SyncOrAsyncSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchemaAsync<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'mutualRecursiveAsync';
  /**
   * The schema reference.
   */
  readonly reference: typeof createRecursiveSchema<MutualRecursiveSchemaAsync>;
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
type Entries = Record<string, SyncOrAsyncSchema>;

/**
 * Creates a map of mutually recursive async schemas.
 *
 * @param build The callback that builds the schema entries. It runs once during construction.
 *
 * @returns A map of recursive async schemas.
 */
export function mutualRecursiveAsync<const TEntries extends Entries>(
  build: (ref: RefFactoryAsync) => TEntries & CheckReferences<TEntries>
): RecursiveSchemasAsync<TEntries>;
export function mutualRecursiveAsync(
  build: (ref: RefFactoryAsync) => Entries
): unknown {
  return createRecursive({
    type: 'mutualRecursiveAsync',
    async: true,
    reference: createRecursiveSchema<MutualRecursiveSchemaAsync>,
    build,
    mutual: createMutualRecursive,
  });
}
