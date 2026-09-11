import type {
  ArrayPathItem,
  BaseSchema,
  Config,
  ErrorMessage,
  ObjectPathItem,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { JsonValue, JsonValueIssue } from './types.ts';

/**
 * JSON value schema interface.
 */
export interface JsonValueSchema<
  TMessage extends ErrorMessage<JsonValueIssue> | undefined,
> extends BaseSchema<JsonValue, JsonValue, JsonValueIssue> {
  /**
   * The schema type.
   */
  readonly type: 'jsonValue';
  /**
   * The schema reference.
   */
  readonly reference: typeof jsonValue;
  /**
   * The expected property.
   */
  readonly expects: '(string | number | boolean | null | Object | Array)';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Checks whether a prototype chain terminates in `null` within one more
 * hop, which every realm's real `Object.prototype` does (its own
 * prototype is `null`), and no other built-in or class prototype does,
 * since they all (directly or transitively) inherit from
 * `Object.prototype`.
 *
 * Hint: `proto` or a prototype further up its chain may be a `Proxy`
 * whose `getPrototypeOf` trap throws. Such a failure is treated as the
 * chain not terminating in `null`, so a hostile prototype cannot abort
 * validation.
 *
 * @param proto The prototype to check, or `null`.
 *
 * @returns Whether the prototype chain is plain-object-shaped.
 */
function _isPlainPrototype(proto: object | null): boolean {
  try {
    return proto === null || Object.getPrototypeOf(proto) === null;
  } catch {
    return false;
  }
}

/**
 * Checks whether an object is a plain object, in a way that also accepts a
 * plain object created in another JavaScript realm (for example another
 * `vm` context or iframe), since such an object has a different
 * `Object.prototype` reference despite being JSON-shaped and serializable.
 *
 * Hint: Rather than comparing `Object.getPrototypeOf(input)` against this
 * realm's `Object.prototype` by reference, or reading the prototype's
 * `constructor` property (which may be a throwing getter or a reassigned,
 * spoofable value), this checks the shape of the prototype chain itself:
 * `input` is treated as a plain object if and only if its prototype is
 * `null` (for example `Object.create(null)`) or its prototype's prototype
 * is `null`.
 *
 * Hint: This is a heuristic, not a sound check, and is not attacker-proof.
 * It can be defeated by a `Proxy` whose `getPrototypeOf` trap fakes a
 * shorter chain (for example making a `Map` or `Date` report a `null`
 * prototype), or by an object whose real prototype chain was deliberately
 * shortened (for example `Object.setPrototypeOf(Foo.prototype, null)`).
 * Both require the caller's own code, or code it already trusted enough to
 * run in the same realm, to construct such a value; there is no
 * in-language check that can be relied on against that threat model. This
 * check only guards against ordinary, non-adversarial inputs, such as a
 * `Date` or class instance passed in by mistake.
 *
 * @param input The object to check.
 *
 * @returns Whether the object is a plain object.
 */
function _isPlainObject(input: object): boolean {
  try {
    return _isPlainPrototype(Object.getPrototypeOf(input) as object | null);
  } catch {
    return false;
  }
}

/**
 * Checks whether an array is a plain array, meaning not an instance of an
 * `Array` subclass. Since `jsonValue` never copies its input, accepting a
 * subclass instance would return it as is, typed as `JsonValue`, even
 * though it may carry extra behavior or state beyond its indexed items.
 *
 * Hint: The caller already established `input` is a real array via
 * `Array.isArray`, which (unlike reading `input`'s prototype) cannot be
 * spoofed by a `Proxy`. So this checks that its prototype is itself a real
 * array too, via that same `Array.isArray` check (this realm's real
 * `Array.prototype`, or a cross-realm equivalent, is itself an array
 * exotic object, whereas an `Array` subclass's prototype, or an ordinary
 * object substituted as the prototype, is not), and that it is otherwise
 * plain-object-shaped one hop up, the same way this realm's real
 * `Object.prototype` is plain-shaped for a plain object. An array whose
 * prototype was explicitly set to `null` is also accepted, matching how a
 * plain object created with `Object.create(null)` is accepted, even
 * though such an array is a rare, deliberate construction rather than
 * something `JSON.parse` would ever produce.
 *
 * Hint: Same limitation as `_isPlainObject`: a `Proxy` wrapping a real
 * `Array` subclass instance can still fake its own `getPrototypeOf` result
 * to look like a plain array.
 *
 * @param input The array to check.
 *
 * @returns Whether the array is a plain array.
 */
function _isPlainArray(input: object): boolean {
  try {
    const proto: unknown = Object.getPrototypeOf(input);
    return (
      proto === null ||
      (Array.isArray(proto) && _isPlainObject(proto as object))
    );
  } catch {
    return false;
  }
}

/**
 * Shallow-clones a list of issues, and copies each issue's `path` array,
 * so the result is fully independent of the original: mutating one array
 * (for example, an ancestor unshifting its own path item onto a `path`)
 * never affects the other.
 *
 * @param issues The issues to clone.
 *
 * @returns The cloned issues.
 */
function _cloneJsonValueIssues(issues: JsonValueIssue[]): JsonValueIssue[] {
  return issues.map((issue) => ({
    ...issue,
    path: issue.path && [...issue.path],
  }));
}

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
 */
function _runJsonValue(
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
          const value: unknown = input[key];
          const itemDataset = _runJsonValue(
            schema,
            { value },
            config,
            visiting,
            validated,
            invalid
          );

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
    } else if (!_isPlainObject(input)) {
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
      // Hint: `dataset.value` is left untouched, so the input object itself
      // is returned as is, unmodified, and no key (including `__proto__`,
      // `prototype`, and `constructor`) is ever excluded
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          const value: unknown = input[key as keyof typeof input];
          const entryDataset = _runJsonValue(
            schema,
            { value },
            config,
            visiting,
            validated,
            invalid
          );

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

/**
 * Creates a JSON value schema.
 *
 * Hint: This schema matches strings, finite numbers, booleans, `null`, and
 * plain objects or arrays that recursively contain only these types. It is
 * validation-only: on success, the input is returned unchanged rather than
 * copied into a new array or object, so `__proto__`, `prototype`, and
 * `constructor` are treated like any other key when they occur as an
 * object's own property, and no data is silently dropped or altered.
 * Because the input is not copied, mutating the returned value also
 * mutates the original input value. An object is only accepted if it is a
 * plain object (including one created in another JavaScript realm, such as
 * a `vm` context or iframe), and an array is only accepted if it is a
 * plain array, not an instance of an `Array` subclass; instances of other
 * classes (for example `Date`, `Map`, or a custom class), including ones
 * with no own enumerable properties, are rejected with an issue, since the
 * input is never copied and so could otherwise be returned as a live
 * instance typed as `JsonValue`. This plain-object and plain-array check is
 * a heuristic for ordinary, non-adversarial input (such as a `Date` passed
 * in by mistake); it is not a sound, attacker-proof guarantee, since a
 * `Proxy` can fake its own prototype, or a class's prototype chain can be
 * deliberately shortened to look plain. An object or array that
 * references itself, directly or through a nested value, is rejected with
 * an issue instead of being followed. A value referenced from many places
 * (for example a diamond-shaped or deeply reused object graph) is walked
 * only once if it is valid, but reports one issue per distinct reference
 * to it if it is invalid, since each reference has its own path from the
 * root; so untrusted input should have both its depth and its overall
 * structural branching bounded before parsing, as very deeply nested input
 * can exceed the call stack, and an invalid value reachable by very many
 * distinct paths can produce a correspondingly large number of issues.
 *
 * @returns A JSON value schema.
 */
export function jsonValue(): JsonValueSchema<undefined>;

/**
 * Creates a JSON value schema.
 *
 * @param message The error message.
 *
 * @returns A JSON value schema.
 */
export function jsonValue<
  const TMessage extends ErrorMessage<JsonValueIssue> | undefined,
>(message: TMessage): JsonValueSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function jsonValue(
  message?: ErrorMessage<JsonValueIssue>
): JsonValueSchema<ErrorMessage<JsonValueIssue> | undefined> {
  return _standardSchema({
    kind: 'schema',
    type: 'jsonValue',
    reference: jsonValue,
    expects: '(string | number | boolean | null | Object | Array)',
    async: false,
    message,
    '~run'(dataset, config) {
      return _runJsonValue(
        this,
        dataset,
        config,
        new WeakSet(),
        new WeakSet(),
        new WeakMap()
      );
    },
  });
}
