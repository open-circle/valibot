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

  // Add message of each issue to summary
  for (const issue of issues) {
    // Add newline if summary is not empty
    if (summary) {
      summary += '\n';
    }

    // Add message to summary
    summary += `× ${issue.message}`;

    // Get dot path from issue
    const dotPath = getDotPath(issue);

    // If dot path is available, add it to summary
    if (dotPath) {
      summary += `\n  → at ${dotPath}`;
    }
  }

  // Return summary
  return summary;
}
