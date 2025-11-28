import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferIssue,
  IssueDotPath,
  Prettify,
} from '../../types/index.ts';
import { getDotPath } from '../../utils/index.ts';

/**
 * Flat errors type.
 */
export type FlatErrors<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    | undefined,
> = Prettify<{
  /**
   * The root errors.
   *
   * Hint: The error messages of issues without a path that belong to the root
   * of the schema are added to this key.
   */
  readonly root?: [string, ...string[]];
  /**
   * The nested errors.
   *
   * Hint: The error messages of issues with a path that belong to the nested
   * parts of the schema and can be converted to a dot path are added to this
   * key.
   */
  readonly nested?: Prettify<
    Readonly<
      Partial<
        Record<
          TSchema extends
            | BaseSchema<unknown, unknown, BaseIssue<unknown>>
            | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
            ? IssueDotPath<TSchema>
            : string,
          [string, ...string[]]
        >
      >
    >
  >;
  /**
   * The other errors.
   *
   * Hint: Some issue paths, for example for complex data types like `Set` and
   * `Map`, have no key or a key that cannot be converted to a dot path. These
   * error messages are added to this key.
   */
  readonly other?: [string, ...string[]];
}>;

/**
 * Flatten the error messages of issues.
 *
 * @param issues The list of issues.
 *
 * @returns A flat error object.
 */
export function flatten(
  issues: readonly [BaseIssue<unknown>, ...BaseIssue<unknown>[]]
): FlatErrors<undefined>;

/**
 * Flatten the error messages of issues.
 *
 * @param issues The list of issues.
 *
 * @returns A flat error object.
 */
export function flatten<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(issues: readonly [InferIssue<TSchema>, ...InferIssue<TSchema>[]]): FlatErrors<TSchema>;

// @__NO_SIDE_EFFECTS__
export function flatten(
  issues: readonly [BaseIssue<unknown>, ...BaseIssue<unknown>[]]
): FlatErrors<undefined> {
  // Create flat errors object
  const flatErrors: FlatErrors<undefined> = {};

  // Add message of each issue to flat errors object
  for (const issue of issues) {
    // If issue has path, add message to nested or other errors
    if (issue.path) {
      // Get dot path from issue
      const dotPath = getDotPath(issue);

      // If path has valid keys, add message to nested errors
      if (dotPath) {
        if (!flatErrors.nested) {
          // @ts-expect-error
          flatErrors.nested = {};
        }
        if (flatErrors.nested![dotPath]) {
          flatErrors.nested![dotPath]!.push(issue.message);
        } else {
          // @ts-expect-error
          flatErrors.nested![dotPath] = [issue.message];
        }

        // Otherwise, add message to other errors
      } else {
        if (flatErrors.other) {
          flatErrors.other.push(issue.message);
        } else {
          // @ts-expect-error
          flatErrors.other = [issue.message];
        }
      }

      // Otherwise, add message to root errors
    } else {
      if (flatErrors.root) {
        flatErrors.root.push(issue.message);
      } else {
        // @ts-expect-error
        flatErrors.root = [issue.message];
      }
    }
  }

  // Return flat errors object
  return flatErrors;
}
