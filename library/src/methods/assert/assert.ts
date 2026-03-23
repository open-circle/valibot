import type { BaseIssue, BaseSchema, InferInput } from '../../types/index.ts';
import { ValiError } from '../../utils/index.ts';

// Shared config — allocating `{ abortEarly: true }` on every call would be wasteful
const ABORT_EARLY_CONFIG = { abortEarly: true } as const;

/**
 * Checks if the input matches the schema. As this is an assertion function, it
 * can be used as a type guard.
 *
 * @param schema The schema to be used.
 * @param input The input to be tested.
 */
export function assert<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, input: unknown): asserts input is InferInput<TSchema> {
  const issues = schema['~run']({ value: input }, ABORT_EARLY_CONFIG).issues;
  if (issues) {
    throw new ValiError(issues);
  }
}
