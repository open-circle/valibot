import type {
  ArrayPathItem,
  Config,
  ErrorMessage,
  ObjectPathItem,
  OutputDataset,
  UnknownDataset,
} from '../../../../types/index.ts';
import { _addIssue } from '../../../../utils/index.ts';
import type {
  JsonValue,
  JsonValueIssue,
  JsonValueSchema,
} from '../../jsonValue.ts';
import { _isPlainArray } from '../_isPlainArray/index.ts';
import { _isPlainObject } from '../_isPlainObject/index.ts';

/**
 * Runs the JSON value schema against a dataset, recursing into nested
 * arrays and objects.
 *
 * Hint: This function only validates; it never creates a new array or
 * object or writes to `dataset.value`. On success (and even on failure),
 * `dataset.value` stays exactly the reference it started as, so no key is
 * ever excluded and no data is changed. Arrays are walked by index from `0`
 * up to `length - 1` (stopping early if `config.abortEarly` is `true` and
 * an item is invalid), so an inherited or sparse index is read just like
 * any other index. Objects are only walked for their own enumerable
 * properties, so `__proto__`, `prototype`, and `constructor` are validated
 * like any other key when they occur as an own property.
 *
 * Hint: `visiting` tracks the arrays and objects currently on the active
 * recursion path (not every value seen), so a value that occurs more than
 * once in sibling branches is still valid. Only a value that references one
 * of its own ancestors forms a cycle and is rejected.
 *
 * Hint: `validated` tracks arrays and objects that were already found fully
 * valid through another reference. A shared valid value would otherwise be
 * walked once per reference, which can cost time exponential in the number
 * of references. Invalid values are always walked again because their issue
 * paths depend on the active recursion path.
 *
 * @param schema The JSON value schema.
 * @param dataset The input dataset.
 * @param config The configuration.
 * @param visiting The arrays and objects on the active recursion path.
 * @param validated The arrays and objects already found fully valid.
 *
 * @returns The output dataset.
 *
 * @internal
 */
export function _runJsonValue(
  schema: JsonValueSchema<ErrorMessage<JsonValueIssue> | undefined>,
  dataset: UnknownDataset,
  config: Config<JsonValueIssue>,
  visiting?: Set<object>,
  validated?: Set<object>
): OutputDataset<JsonValue, JsonValueIssue> {
  // Get input value from dataset
  const input = dataset.value;

  // If input is a primitive JSON value, mark dataset as typed
  if (
    typeof input === 'string' ||
    (typeof input === 'number' && Number.isFinite(input)) ||
    typeof input === 'boolean' ||
    input === null
  ) {
    // @ts-expect-error
    dataset.typed = true;

    // If input is an array or object, check nested values
  } else if (typeof input === 'object') {
    // Create traversal state lazily for non-primitive inputs
    visiting ??= new Set();
    validated ??= new Set();

    // If input was already found fully valid, mark dataset as typed
    if (validated.has(input)) {
      // @ts-expect-error
      dataset.typed = true;

      // If input references one of its ancestors, add JSON value issue
    } else if (visiting.has(input)) {
      _addIssue(schema, 'type', dataset, config, {
        received: 'circular reference',
      });
    } else {
      const isArray = Array.isArray(input);

      // If input is not plain array or object, add JSON value issue
      if (isArray ? !_isPlainArray(input) : !_isPlainObject(input)) {
        _addIssue(schema, 'type', dataset, config);
      } else {
        // Track input for duration of recursion
        visiting.add(input);

        // @ts-expect-error
        dataset.typed = true;

        // Get own enumerable keys of object, if necessary
        // Hint: Arrays are walked by index instead, so an inherited or sparse
        // index is read just like any other index, and their length is read
        // on each iteration, so items added while walking are checked too
        const keys = isArray ? undefined : Object.keys(input);

        // Check each array item or object entry recursively
        // Hint: `dataset.value` is left untouched, so input array or object
        // itself is returned as is, unmodified
        for (
          let index = 0;
          index < (keys ?? (input as unknown[])).length;
          index++
        ) {
          const key = keys ? keys[index] : index;
          const value: unknown = (input as Record<PropertyKey, unknown>)[key];
          const entryDataset = _runJsonValue(
            schema,
            { value },
            config,
            visiting,
            validated
          );

          // If there are issues, capture them
          if (entryDataset.issues) {
            // Create array or object path item
            const pathItem: ArrayPathItem | ObjectPathItem =
              typeof key === 'number'
                ? {
                    type: 'array',
                    origin: 'value',
                    input: input as unknown[],
                    key,
                    value,
                  }
                : {
                    type: 'object',
                    origin: 'value',
                    input: input as Record<string, unknown>,
                    key,
                    value,
                  };

            // Add modified entry dataset issues to issues
            for (const issue of entryDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                // @ts-expect-error
                issue.path = [pathItem];
              }
              // @ts-expect-error
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              // @ts-expect-error
              dataset.issues = entryDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If entry is not typed, mark dataset as untyped
          if (!entryDataset.typed) {
            dataset.typed = false;
          }
        }

        // Stop tracking input after recursion
        visiting.delete(input);

        // If input is valid, remember it for other references
        if (!dataset.issues) {
          validated.add(input);
        }
      }
    }

    // Otherwise, add JSON value issue
  } else {
    _addIssue(schema, 'type', dataset, config);
  }

  // Return output dataset
  // @ts-expect-error
  return dataset as OutputDataset<JsonValue, JsonValueIssue>;
}
