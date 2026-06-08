import type {
  BaseIssue,
  IssuePathItem,
  PartialDataset,
} from '../../types/index.ts';

type Issues = PartialDataset<unknown, BaseIssue<unknown>>['issues'];

type PathMode = 'prepend' | 'replace';

interface PathIssueDataset {
  issues?: Issues | undefined;
}

/**
 * Adds copies of nested issues with a modified path to the dataset.
 *
 * @param dataset The dataset to add issues to.
 * @param pathItem The path item to add.
 * @param issues The nested issues to add.
 * @param pathMode The path mode to use.
 *
 * @internal
 */
export function _addPathIssues(
  dataset: PathIssueDataset,
  pathItem: IssuePathItem,
  issues: Issues,
  pathMode: PathMode = 'prepend'
): void {
  const parentIssues = dataset.issues;
  const getIssueWithPath = (issue: BaseIssue<unknown>): BaseIssue<unknown> => ({
    ...issue,
    path:
      pathMode === 'prepend' && issue.path
        ? [pathItem, ...issue.path]
        : [pathItem],
  });
  const nextIssues: Issues = [
    getIssueWithPath(issues[0]),
    ...issues.slice(1).map(getIssueWithPath),
  ];

  if (parentIssues) {
    parentIssues.push(...nextIssues);
  } else {
    dataset.issues = nextIssues;
  }
}
