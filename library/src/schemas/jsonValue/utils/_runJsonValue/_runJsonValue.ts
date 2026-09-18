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
import { _cloneJsonValueIssues } from '../_cloneJsonValueIssues/index.ts';
import { _isPlainArray } from '../_isPlainArray/index.ts';
import {
  _isConstructorPrototype,
  _isPlainObject,
} from '../_isPlainObject/index.ts';

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
 * valid (with no issues), and `invalid` tracks ones that were already found
 * to have specific issues, via some other reference to them. A shared
 * value referenced from many places (for example a diamond-shaped or
 * deeply reused object graph) would otherwise be re-walked once per
 * reference to it, which costs time exponential in the number of
 * references, whether or not it turns out valid. A value only ever enters
 * `validated` or `invalid` after it is removed from `visiting`, at which
 * point it is necessarily acyclic (any cycle through it would have been
 * caught while it was still on the active path) and its own issues (if
 * any) are fully known, so reusing that outcome for another reference to
 * it cannot change it. `invalid`'s cached issues are shallow-cloned, and
 * their `path` arrays copied, both when stored and on every reuse, since
 * each occurrence's own ancestors prepend their own path item to `path` by
 * mutating it in place; without independent copies, path items from one
 * occurrence's ancestry would leak into another's. `invalid` bounds the
 * cost of re-validating a shared invalid value's own content (for example
 * re-invoking a getter on one of its properties) to once, regardless of
 * how many times it is referenced, but each reference still contributes
 * its own, differently-pathed copy of its issues to the result, since that
 * is the only accurate way to report where each reference actually is; so
 * the total number of issues can still grow with the number of references
 * to an invalid value, even though the work to discover them does not grow
 * with the size of its own content.
 *
 * @param schema The JSON value schema.
 * @param dataset The input dataset.
 * @param config The configuration.
 * @param visiting The arrays and objects on the active recursion path.
 * @param validated The arrays and objects already found fully valid.
 * @param invalid The arrays and objects already found invalid, and why.
 *
 * @returns The output dataset.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _runJsonValue(
  schema: JsonValueSchema<ErrorMessage<JsonValueIssue> | undefined>,
  dataset: UnknownDataset,
  config: Config<JsonValueIssue>,
  visiting: WeakSet<object>,
  validated: WeakSet<object>,
  invalid: WeakMap<object, JsonValueIssue[]>
): OutputDataset<JsonValue, JsonValueIssue> {
  // Get input value from dataset
  const input = dataset.value;

  // If input is a primitive JSON value, it is valid as is
  if (
    typeof input === 'string' ||
    (typeof input === 'number' && Number.isFinite(input)) ||
    typeof input === 'boolean' ||
    input === null
  ) {
    // @ts-expect-error
    dataset.typed = true;

    // If input is an array or object, check it for circular references
    // and then check each item or entry recursively
  } else if (typeof input === 'object') {
    // If input was already found fully valid via another reference to it,
    // accept it again without re-walking it
    if (validated.has(input)) {
      // @ts-expect-error
      dataset.typed = true;

      // If input was already found invalid via another reference to it,
      // reuse those issues instead of re-walking it
    } else if (invalid.has(input)) {
      dataset.typed = false;
      // @ts-expect-error
      dataset.issues = _cloneJsonValueIssues(invalid.get(input)!);

      // If input references one of its own ancestors, add JSON value issue
    } else if (visiting.has(input)) {
      _addIssue(schema, 'type', dataset, config, {
        received: 'circular reference',
      });

      // If input is an array, check each item recursively
    } else if (Array.isArray(input)) {
      // If input is not a plain array, add JSON value issue
      // Hint: Unlike `record`, this schema never copies the input into a
      // new array. If an instance of an `Array` subclass were accepted
      // here, it would be returned as is and typed as `JsonValue`, even
      // though it may carry extra behavior or state.
      if (!_isPlainArray(input)) {
        _addIssue(schema, 'type', dataset, config);

        // Otherwise, check each item recursively
      } else {
        // Track input as being visited for the duration of this recursion
        visiting.add(input);

        // @ts-expect-error
        dataset.typed = true;

        // Check each array item recursively by reusing this same schema
        // Hint: `dataset.value` is left untouched, so the input array itself
        // is returned as is, unmodified
        for (let key = 0; key < input.length; key++) {
          // Hint: Reading a numeric index can invoke a hostile accessor
          // (for example a throwing getter defined via
          // `Object.defineProperty`) the same way reading an object's own
          // property can. Such a failure is treated as an invalid item, not
          // as a reason to let the exception escape and abort validation of
          // the entire input.
          let value: unknown;
          let itemDataset: OutputDataset<JsonValue, JsonValueIssue>;
          try {
            value = input[key];
            itemDataset = _runJsonValue(
              schema,
              { value },
              config,
              visiting,
              validated,
              invalid
            );
          } catch {
            itemDataset = {} as OutputDataset<JsonValue, JsonValueIssue>;
            _addIssue(schema, 'type', itemDataset, config, {
              received: 'an unreadable value',
            });
          }

          // If there are issues, capture them
          if (itemDataset.issues) {
            // Create array path item
            const pathItem: ArrayPathItem = {
              type: 'array',
              origin: 'value',
              input,
              key,
              value,
            };

            // Add modified item dataset issues to issues
            for (const issue of itemDataset.issues) {
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
              dataset.issues = itemDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If not typed, set typed to `false`
          if (!itemDataset.typed) {
            dataset.typed = false;
          }
        }

        // Input is no longer on the active recursion path
        visiting.delete(input);

        // Remember the outcome for any other reference to input, so it is
        // not re-walked
        if (dataset.issues) {
          invalid.set(input, _cloneJsonValueIssues(dataset.issues));
        } else {
          validated.add(input);
        }
      }

      // If input is not a plain object, add JSON value issue
      // Hint: Unlike `record`, this schema never copies the input into a
      // new plain object. If an instance of another class (for example
      // `Date` or `Map`) were accepted here, it would be returned as is
      // and typed as `JsonValue`, even though it is not actually a plain
      // JSON-shaped value.
      // Hint: `_isPlainObject` alone cannot tell a plain object apart from
      // a constructor's own `.prototype` object (for example
      // `Date.prototype`), since it sits at the same one-hop depth above
      // `Object.prototype`. `_isConstructorPrototype` catches that case;
      // it is checked here, on the actual input, rather than inside
      // `_isPlainObject` itself, since `_isPlainArray` also reuses
      // `_isPlainObject` to check an array's own prototype (real
      // `Array.prototype`, which is itself such a constructor prototype
      // and must keep passing that unrelated check).
    } else if (!_isPlainObject(input) || _isConstructorPrototype(input)) {
      _addIssue(schema, 'type', dataset, config);

      // Otherwise, input is a plain object, so check each entry recursively
    } else {
      // Track input as being visited for the duration of this recursion
      visiting.add(input);

      // @ts-expect-error
      dataset.typed = true;

      // Check each object entry recursively by reusing this same schema
      // Hint: for...in loop always returns keys as strings
      // Hint: We only check the input's own enumerable properties, the
      // same way `JSON.stringify` ignores inherited ones
      // Hint: A `toJSON` method is never invoked here, unlike
      // `JSON.stringify`. An enumerable own `toJSON` is walked and rejected
      // like any other function-valued property; a non-enumerable own or
      // inherited `toJSON` is silently skipped, so the accepted shape can
      // differ from what `JSON.stringify` would actually produce
      // Hint: `dataset.value` is left untouched, so the input object itself
      // is returned as is, unmodified, and no key (including `__proto__`,
      // `prototype`, and `constructor`) is ever excluded
      // Hint: Reading an own property (including `constructor`) can invoke
      // a hostile accessor, enumerable or not, that throws. Such a failure
      // is treated as an invalid entry, not as a reason to let the
      // exception escape and abort validation of the entire input.
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          let value: unknown;
          let entryDataset: OutputDataset<JsonValue, JsonValueIssue>;
          try {
            value = input[key as keyof typeof input];
            entryDataset = _runJsonValue(
              schema,
              { value },
              config,
              visiting,
              validated,
              invalid
            );
          } catch {
            entryDataset = {} as OutputDataset<JsonValue, JsonValueIssue>;
            _addIssue(schema, 'type', entryDataset, config, {
              received: 'an unreadable value',
            });
          }

          // If there are issues, capture them
          if (entryDataset.issues) {
            // Create object path item
            const pathItem: ObjectPathItem = {
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

          // If not typed, set typed to `false`
          if (!entryDataset.typed) {
            dataset.typed = false;
          }
        }
      }

      // Input is no longer on the active recursion path
      visiting.delete(input);

      // Remember the outcome for any other reference to input, so it is
      // not re-walked
      if (dataset.issues) {
        invalid.set(input, _cloneJsonValueIssues(dataset.issues));
      } else {
        validated.add(input);
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
