import type {
  BaseIssue,
  IssuePathItem,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';

/**
 * Adds nested issues with a prepended path item to the dataset.
 *
 * @param dataset The dataset to add issues to.
 * @param pathItem The path item to prepend.
 * @param issues The nested issues to add.
 *
 * @internal
 */
export function _addPathIssues(
  dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>,
  pathItem: IssuePathItem,
  issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]]
): void {
  const parentIssues = dataset.issues;
  for (const issue of issues) {
    if (issue.path) {
      issue.path.unshift(pathItem);
    } else {
      // @ts-expect-error
      issue.path = [pathItem];
    }
    if (parentIssues) {
      parentIssues.push(issue);
    }
  }
  if (!parentIssues) {
    // @ts-expect-error
    dataset.issues = issues;
  }
}
