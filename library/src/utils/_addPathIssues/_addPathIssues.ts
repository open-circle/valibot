import type {
  BaseIssue,
  IssuePathItem,
  PartialDataset,
} from '../../types/index.ts';

/**
 * Issue list type.
 */
type Issues = PartialDataset<unknown, BaseIssue<unknown>>['issues'];

/**
 * Dataset that can receive path issues.
 */
interface PathIssueDataset {
  /**
   * The dataset issues.
   */
  issues?: Issues | undefined;
}

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
  dataset: PathIssueDataset,
  pathItem: IssuePathItem,
  issues: Issues
): void {
  const parentIssues = dataset.issues;
  const getIssueWithPath = (issue: BaseIssue<unknown>): BaseIssue<unknown> => ({
    ...issue,
    path: issue.path ? [pathItem, ...issue.path] : [pathItem],
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
