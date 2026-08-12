import type { BaseIssue, OutputDataset } from '../../types/index.ts';

/**
 * Returns the sub issues of the provided datasets for a combinator issue
 * (for example `union` or `anyOf`).
 *
 * @param datasets The datasets. Every dataset must have its `issues`
 * defined, as guaranteed by the caller.
 *
 * @returns The sub issues.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _subIssues(
  datasets: OutputDataset<unknown, BaseIssue<unknown>>[] | undefined
): [BaseIssue<unknown>, ...BaseIssue<unknown>[]] | undefined {
  let issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]] | undefined;
  if (datasets) {
    for (const dataset of datasets) {
      if (issues) {
        // Hint: The caller only passes datasets whose `issues` is defined,
        // so `dataset.issues` can never be `undefined` here.
        for (const issue of dataset.issues!) {
          issues.push(issue);
        }
      } else {
        issues = dataset.issues;
      }
    }
  }
  return issues;
}
