import type { BaseIssue, OutputDataset } from '../../../../types/index.ts';
import type { Paths } from '../../types.ts';

/**
 * Checks if a dataset is partially typed.
 *
 * @param dataset The dataset to check.
 * @param paths The paths to check.
 *
 * @returns Whether it is partially typed.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isPartiallyTyped(
  dataset: OutputDataset<unknown, BaseIssue<unknown>>,
  paths: Paths
): boolean {
  // If issues exist, check if a specified path matches path of a schema issue
  if (dataset.issues) {
    for (const path of paths) {
      for (const issue of dataset.issues) {
        // Hint: We also mark the data as untyped if there are validation
        // issues, since the data could potentially be untyped if a pipeline
        // contains a transformation action.

        // Create typed variable
        let typed = false;

        // Calculate bound of match check
        const bound = Math.min(path.length, issue.path?.length ?? 0);

        // Mark data as typed if any path items of same index do not match
        for (let index = 0; index < bound; index++) {
          if (
            // @ts-expect-error
            path[index] !== issue.path[index].key &&
            // @ts-expect-error
            (path[index] !== '$' || issue.path[index].type !== 'array')
          ) {
            typed = true;
            break;
          }
        }

        // Return false if untyped
        if (!typed) {
          return false;
        }
      }
    }
  }

  // Return true if typed
  return true;
}
