import { _isSameValueZero } from '../../../../utils/index.ts';

/**
 * Merge dataset type.
 */
type MergeDataset =
  | { value: unknown; issue?: undefined }
  | { value?: undefined; issue: true };

/**
 * Merges two values into one single output.
 *
 * @param value1 First value.
 * @param value2 Second value.
 *
 * @returns The merge dataset.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _merge(value1: unknown, value2: unknown): MergeDataset {
  // Continue if data type of values match
  if (typeof value1 === typeof value2) {
    // Return first value if both are equal
    if (
      _isSameValueZero(value1, value2) ||
      (value1 instanceof Date &&
        value2 instanceof Date &&
        _isSameValueZero(+value1, +value2))
    ) {
      return { value: value1 };
    }

    // Return deeply merged object
    // Hint: Keep the fast constructor check and fall back to the prototype
    // when an own constructor property shadows Object.
    if (
      value1 &&
      value2 &&
      (value1.constructor === Object ||
        Object.getPrototypeOf(value1)?.constructor === Object) &&
      (value2.constructor === Object ||
        Object.getPrototypeOf(value2)?.constructor === Object)
    ) {
      // Hint: Spreading both values creates own data properties without
      // invoking inherited setters.
      const nextValue = { ...value1, ...value2 };

      // Deeply merge shared entries into `nextValue`
      // Hint: for...in avoids allocating a keys array.
      for (const key in value2) {
        // Hint: Check value1 first to skip non-shared keys early. The second
        // check prevents inherited value2 entries from being merged.
        if (
          Object.prototype.hasOwnProperty.call(value1, key) &&
          Object.prototype.hasOwnProperty.call(value2, key)
        ) {
          // @ts-expect-error
          const dataset = _merge(value1[key], value2[key]);

          // If dataset has issue, return it
          if (dataset.issue) {
            return dataset;
          }

          // Otherwise, replace merged entry
          // @ts-expect-error
          nextValue[key] = dataset.value;
        }
      }

      // Return deeply merged object
      return { value: nextValue };
    }

    // Return deeply merged array
    if (Array.isArray(value1) && Array.isArray(value2)) {
      // Continue if arrays have same length
      if (value1.length === value2.length) {
        const nextValue = [...value1];

        // Merge items of `value2` into `nextValue`
        for (let index = 0; index < value1.length; index++) {
          const dataset = _merge(value1[index], value2[index]);

          // If dataset has issue, return it
          if (dataset.issue) {
            return dataset;
          }

          // Otherwise, replace merged items
          nextValue[index] = dataset.value;
        }

        // Return deeply merged array
        return { value: nextValue };
      }
    }
  }

  // Otherwise, return that values can't be merged
  return { issue: true };
}
