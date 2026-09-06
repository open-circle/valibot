import type { BaseIssue, OutputDataset } from '../../types/index.ts';

/**
 * Creates a shallow copy of a dataset.
 *
 * Hint: The `value` is copied by reference, but the `issues` array, its issues
 * and their `path` arrays are cloned to avoid reusing mutable dataset state
 * across multiple runs. Mutating a returned object or array value can
 * therefore affect later cache hits that reuse the same cached output.
 *
 * @param dataset The output dataset.
 *
 * @returns The copied output dataset.
 */
// @__NO_SIDE_EFFECTS__
export function _cloneDataset<TValue, TIssue extends BaseIssue<unknown>>(
  dataset: OutputDataset<TValue, TIssue>
): OutputDataset<TValue, TIssue> {
  // Hint: We assign the known dataset properties directly instead of using the
  // spread operator for better runtime performance.
  // @ts-expect-error
  return {
    typed: dataset.typed,
    value: dataset.value,
    // Hint: Parent schemas and the `forward` method add path items to the
    // issues they receive. We therefore clone each issue and its `path` array,
    // so that these mutations are not applied to the same issue again on every
    // following run.
    issues: dataset.issues?.map((issue) => ({
      ...issue,
      path: issue.path && [...issue.path],
    })) as OutputDataset<TValue, TIssue>['issues'],
  };
}
