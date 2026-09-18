import type { BaseIssue, BaseSchema, ErrorMessage } from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';
import { _runJsonValue } from './utils/index.ts';

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
 * Creates a JSON value schema.
 *
 * Hint: This schema matches strings, finite numbers, booleans, `null`, and
 * plain objects or arrays that recursively contain only these types. It
 * checks this structural shape directly rather than testing whether the
 * input is JSON-serializable; in particular, a `toJSON` method is never
 * invoked. An enumerable own `toJSON` is checked as an ordinary property
 * value and rejected, since a function is not a JSON value, while a
 * non-enumerable own `toJSON`, or one inherited from a plain-shaped
 * prototype, is skipped entirely, just like any other non-enumerable or
 * inherited property. Either way, this schema's outcome can differ from
 * what `JSON.stringify` would actually produce for the same input. It is
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
