import type {
  BaseIssue,
  BaseValidation,
  IssuePathItem,
} from '../../types/index.ts';
import type { RequiredPath, ValidPath } from './types.ts';

// TODO: We should try to find a better way to type this function without
// breaking the type inference, as the current implementation loses some type
// information by returning a `BaseValidation` instead of the original type.
// In the process, we should also figure out how to add a `.forward' property
// to the returnd object in a type-safe way, similar to how the `fallback`
// method works.

/**
 * Forwards the issues of the passed validation action.
 *
 * @param action The validation action.
 * @param path The path to forward the issues to.
 *
 * @returns The modified action.
 */
// @__NO_SIDE_EFFECTS__
export function forward<
  TInput extends Record<string, unknown> | ArrayLike<unknown>,
  TIssue extends BaseIssue<unknown>,
  const TPath extends RequiredPath,
>(
  action: BaseValidation<TInput, TInput, TIssue>,
  path: ValidPath<TInput, TPath>
): BaseValidation<TInput, TInput, TIssue> {
  return {
    ...action,
    '~run'(dataset, config) {
      // Create copy of previous issues
      const prevIssues = dataset.issues && [...dataset.issues];

      // Run validation action
      dataset = action['~run'](dataset, config);

      // If dataset contains issues, forward newly added issues
      if (dataset.issues) {
        for (const issue of dataset.issues) {
          if (!prevIssues?.includes(issue)) {
            // Create path input variable
            let pathInput: unknown = dataset.value;

            // Try to forward issue to end of path list
            for (const key of path) {
              // Create path value variable
              // @ts-expect-error
              const pathValue: unknown = pathInput[key];

              // Create path item for current key
              const pathItem: IssuePathItem = {
                type: 'unknown',
                origin: 'value',
                input: pathInput,
                key,
                value: pathValue,
              };

              // Forward issue by adding path item
              if (issue.path) {
                issue.path.push(pathItem);
              } else {
                // @ts-expect-error
                issue.path = [pathItem];
              }

              // If path value is undefined, stop forwarding
              if (!pathValue) {
                break;
              }

              // Set next path input to current path value
              pathInput = pathValue;
            }
          }
        }
      }

      // Return output dataset
      return dataset;
    },
  };
}
