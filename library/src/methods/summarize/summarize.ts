import type { BaseIssue } from '../../types/index.ts';
import { getDotPath } from '../../utils/index.ts';

/**
 * Summarize the error messages of issues in a pretty-printable multi-line string.
 *
 * @param issues The list of issues.
 *
 * @returns A summary of the issues.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function summarize(
  issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]]
): string {
  // Create variable to store summary
  let summary = '';

  // Create function to add issues and their sub issues to summary
  const addIssues = (issues: BaseIssue<unknown>[], indent: string): void => {
    // Add message of each issue to summary
    for (const issue of issues) {
      // Add newline if summary is not empty
      if (summary) {
        summary += '\n';
      }

      // Add message to summary
      summary += `${indent}× ${issue.message}`;

      // Get dot path from issue
      const dotPath = getDotPath(issue);

      // If dot path is available, add it to summary
      if (dotPath) {
        summary += `\n${indent}  → at ${dotPath}`;
      }

      // If there are sub issues, add the ones with a path indented below
      // Hint: Sub issues without a path, like the type issues of the options
      // of `union([string(), number()])`, are skipped because the message of
      // the parent issue already covers them. The path of a sub issue is
      // relative to its parent issue, so the parent path is prepended to it.
      if (issue.issues) {
        const subIssues: BaseIssue<unknown>[] = [];
        for (const subIssue of issue.issues) {
          if (subIssue.path) {
            subIssues.push(
              issue.path
                ? { ...subIssue, path: [...issue.path, ...subIssue.path] }
                : subIssue
            );
          }
        }
        addIssues(subIssues, `${indent}  `);
      }
    }
  };

  // Add issues to summary
  addIssues(issues, '');

  // Return summary
  return summary;
}
