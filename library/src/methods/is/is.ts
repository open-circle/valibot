import type { BaseIssue, BaseSchema, InferInput, UnknownDataset } from '../../types/index.ts';

// Shared config — allocating `{ abortEarly: true }` on every call would be wasteful
const ABORT_EARLY_CONFIG = { abortEarly: true } as const;

// Reusable dataset frame; safe because is() is synchronous and non-reentrant
const _dataset: UnknownDataset = { value: undefined, typed: false, issues: undefined };

/**
 * Checks if the input matches the schema. By using a type predicate, this
 * function can be used as a type guard.
 *
 * @param schema The schema to be used.
 * @param input The input to be tested.
 *
 * @returns Whether the input matches the schema.
 */
// @__NO_SIDE_EFFECTS__
export function is<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, input: unknown): input is InferInput<TSchema> {
  _dataset.value = input;
  _dataset.typed = false;
  _dataset.issues = undefined;
  return !schema['~run'](_dataset, ABORT_EARLY_CONFIG).issues;
}
