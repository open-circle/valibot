import type { BaseIssue } from '../../types/index.ts';

/**
 * JSON value type.
 *
 * Represents strings, finite numbers, booleans, `null`, and objects or
 * arrays that recursively contain only these types.
 *
 * Hint: TypeScript has no dedicated type for finite numbers, so `NaN`,
 * `Infinity`, and `-Infinity` type-check as `JsonValue` even though the
 * `jsonValue` schema rejects them at runtime.
 *
 * Hint: The object variant's index signature means an `interface`-declared
 * object type is only assignable to `JsonValue` if it also declares a
 * matching index signature; otherwise, add an index signature to the
 * interface, or convert it to a `type` alias, to assign it.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

/**
 * JSON value issue interface.
 */
export interface JsonValueIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'jsonValue';
  /**
   * The expected property.
   */
  readonly expected: '(string | number | boolean | null | Object | Array)';
}
