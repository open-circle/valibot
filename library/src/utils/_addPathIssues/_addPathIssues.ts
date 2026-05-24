import type {
  BaseIssue,
  IssuePathItem,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';

/**
 * Adds copies of nested issues with a prepended path item to the dataset.
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
  const getIssueWithPath = (issue: BaseIssue<unknown>): BaseIssue<unknown> => ({
    ...issue,
    path: issue.path ? [pathItem, ...issue.path] : [pathItem],
  });
  const nextIssues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]] = [
    getIssueWithPath(issues[0]),
    ...issues.slice(1).map(getIssueWithPath),
  ];

  if (parentIssues) {
    parentIssues.push(...nextIssues);
  } else {
    // @ts-expect-error
    dataset.issues = nextIssues;
  }
}
