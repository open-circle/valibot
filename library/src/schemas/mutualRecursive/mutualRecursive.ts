import type {
  BaseIssue,
  BaseSchema,
  GenericSchema,
} from '../../types/index.ts';
import { createRecursive } from '../recursive/_createRecursive.ts';
import { createRecursiveSchema } from '../recursive/_recursive.ts';
import {
  type CheckReferences,
  createMutualRecursive,
  type RecursiveSchemas,
  type RefFactory,
} from './_mutualRecursive.ts';

export type { RefFactory } from './_mutualRecursive.ts';
export {
  OwnerSymbol,
  type Ref,
  type RecursiveArray,
  type RecursiveMarker,
  type RecursiveMarkerSymbol,
  type RecursiveReadonlyArray,
  type RecursiveReferences,
  type ResolveRecursiveInput,
  type ResolveRecursiveOutput,
} from '../recursive/_recursive.ts';

/**
 * Recursive schema interface.
 */
export interface MutualRecursiveSchema<
  TWrapped extends GenericSchema = GenericSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchema<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'mutualRecursive';
  /**
   * The schema reference.
   */
  readonly reference: typeof createRecursiveSchema<MutualRecursiveSchema>;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
}

type Entries = Record<string, GenericSchema>;

/**
 * Creates a map of mutually recursive schemas.
 *
 * @param build The callback that builds the schema entries. It runs once during construction.
 *
 * @returns A map of recursive schemas.
 */
export function mutualRecursive<
  const TEntries extends Record<string, GenericSchema>,
>(
  build: (ref: RefFactory) => TEntries & CheckReferences<TEntries>
): RecursiveSchemas<TEntries>;
export function mutualRecursive(build: (ref: RefFactory) => Entries): unknown {
  return createRecursive({
    type: 'mutualRecursive',
    async: false,
    reference: createRecursiveSchema<MutualRecursiveSchema>,
    build,
    mutual: createMutualRecursive,
  });
}
