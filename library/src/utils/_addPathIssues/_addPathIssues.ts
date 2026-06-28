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
  for (const issue of issues) {
    const issueWithPath: BaseIssue<unknown> = {
      ...issue,
      path:
        pathMode === 'prepend' && issue.path
          ? [pathItem, ...issue.path]
          : [pathItem],
    };

    if (dataset.issues) {
      dataset.issues.push(issueWithPath);
    } else {
      dataset.issues = [issueWithPath];
    }
  }
}
