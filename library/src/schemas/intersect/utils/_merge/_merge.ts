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
      value1 === value2 ||
      (value1 instanceof Date && value2 instanceof Date && +value1 === +value2)
    ) {
      return { value: value1 };
    }

    // Return deeply merged object
    if (
      value1 &&
      value2 &&
      value1.constructor === Object &&
      value2.constructor === Object
    ) {
      const nextValue = { ...value1 };

      // Deeply merge entries of `value2` into `nextValue`
      for (const key in value2) {
        // @ts-expect-error
        if (key in value1) {
          // @ts-expect-error
          const dataset = _merge(value1[key], value2[key]);

          // If dataset has issue, return it
          if (dataset.issue) {
            return dataset;
          }

          // Otherwise, replace merged entry
          // @ts-expect-error
          nextValue[key] = dataset.value;

          // Otherwise, just add entry
        } else {
          // @ts-expect-error
          nextValue[key] = value2[key];
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
