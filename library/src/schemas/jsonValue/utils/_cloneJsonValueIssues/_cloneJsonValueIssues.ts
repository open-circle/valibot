import type { JsonValueIssue } from '../../jsonValue.ts';

/**
 * Shallow-clones a list of issues, and copies each issue's `path` array,
 * so the result is fully independent of the original: mutating one array
 * (for example, an ancestor unshifting its own path item onto a `path`)
 * never affects the other.
 *
 * @param issues The issues to clone.
 *
 * @returns The cloned issues.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _cloneJsonValueIssues(
  issues: JsonValueIssue[]
): JsonValueIssue[] {
  return issues.map((issue) => ({
    ...issue,
    path: issue.path && [...issue.path],
  }));
}
