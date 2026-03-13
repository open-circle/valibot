import type { IsAny, IsNever } from '../../types/index.ts';

/**
 * Extracts the exact keys of a tuple, array or object.
 */
type KeyOf<TValue> =
  IsAny<TValue> extends true
    ? never
    : TValue extends readonly unknown[]
      ? number extends TValue['length']
        ? number
        : {
            [TKey in keyof TValue]: TKey extends `${infer TIndex extends number}`
              ? TIndex
              : never;
          }[number]
      : TValue extends Record<string, unknown>
        ? keyof TValue & (string | number)
        : never;

/**
 * Path type.
 */
type Path = readonly (string | number)[];

/**
 * Required path type.
 */
export type RequiredPath = readonly [string | number, ...Path];

/**
 * Lazily evaluate only the first valid path segment based on the given value.
 */
type LazyPath<
  TValue,
  TPathToCheck extends Path,
  TValidPath extends Path = readonly [],
> =
  // If path to check is empty, return last valid path
  TPathToCheck extends readonly []
    ? TValidPath
    : // If first key of path to check is valid, continue with next key
      TPathToCheck extends readonly [
          infer TFirstKey extends KeyOf<TValue> & keyof TValue,
          ...infer TPathRest extends Path,
        ]
      ? LazyPath<
          TValue[TFirstKey],
          TPathRest,
          readonly [...TValidPath, TFirstKey]
        >
      : // If current value has valid keys, return them
        IsNever<KeyOf<TValue>> extends false
        ? readonly [...TValidPath, KeyOf<TValue>]
        : // Otherwise, return only last valid path
          TValidPath;

/**
 * Returns the path if valid, otherwise the first possible valid path based on
 * the given value.
 */
export type ValidPath<
  TValue extends Record<string, unknown> | ArrayLike<unknown>,
  TPath extends RequiredPath,
> = TPath extends LazyPath<TValue, TPath> ? TPath : LazyPath<TValue, TPath>;
