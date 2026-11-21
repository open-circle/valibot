import type {
  BaseIssue,
  BaseSchema,
  GenericSchema,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { createRecursive } from './_createRecursive.ts';
import {
  type Ref,
  type ResolveRecursiveInput,
  type ResolveRecursiveIssue,
  type ResolveRecursiveOutput,
} from './_recursive.ts';

/**
 * Recursive schema interface.
 */
export interface RecursiveSchema<
  TWrapped extends GenericSchema = GenericSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchema<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'recursive';
  /**
   * The schema reference.
   */
  readonly reference: typeof recursive<GenericSchema>;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
}

/**
 * Resolved recursive schema interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchema<
  TWrapped extends GenericSchema,
  TInputRoot = InferInput<TWrapped>,
  TOutputRoot = InferOutput<TWrapped>,
  TIssue extends BaseIssue<unknown> = InferIssue<TWrapped>,
> extends RecursiveSchema<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    ResolveRecursiveIssue<TIssue>
  > {}

/**
 * Creates a recursive schema.
 *
 * @param definition The schema definition. It runs once during construction.
 *
 * @returns A recursive schema.
 */
export function recursive<const TWrapped extends GenericSchema>(
  definition: (self: Ref) => TWrapped
): ResolvedRecursiveSchema<TWrapped>;
export function recursive(definition: (self: Ref) => GenericSchema): unknown {
  return createRecursive({
    type: 'recursive',
    async: false,
    reference: recursive<GenericSchema>,
    build: definition,
  });
}
