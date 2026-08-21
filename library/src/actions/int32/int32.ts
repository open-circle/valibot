import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

/** The int32 bounds: [-2^31, 2^31 - 1]. */
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

/**
 * Int32 issue interface.
 */
export interface Int32Issue<TInput extends ValueInput>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'int32';
  readonly expected: `(${string};${string})`;
  readonly requirement: readonly [number, number];
}

/**
 * Int32 action interface.
 */
export interface Int32Action<
  TInput extends ValueInput,
  TMessage extends ErrorMessage<Int32Issue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, Int32Issue<TInput>> {
  readonly type: 'int32';
  readonly reference: typeof int32;
  readonly expects: `(${string};${string})`;
  readonly requirement: readonly [number, number];
  readonly message: TMessage;
}

/**
 * Creates an int32 validation action.
 *
 * Validates that a number is within the signed 32-bit integer range
 * [-2147483648, 2147483647] (the `int32` OpenAPI format). Use it together with
 * {@link integer} to also require an integer (this action accepts any number
 * in range, including decimals). See issue #1239.
 *
 * @returns An int32 action.
 */
export function int32<TInput extends ValueInput>(): Int32Action<TInput, undefined>;

/**
 * Creates an int32 validation action.
 *
 * @param message The error message.
 *
 * @returns An int32 action.
 */
export function int32<
  TInput extends ValueInput,
  const TMessage extends ErrorMessage<Int32Issue<TInput>> | undefined,
>(message: TMessage): Int32Action<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function int32(
  message?: ErrorMessage<Int32Issue<ValueInput>>,
): Int32Action<ValueInput, ErrorMessage<Int32Issue<ValueInput>> | undefined> {
  return {
    kind: 'validation',
    type: 'int32',
    reference: int32,
    async: false,
    expects: `(${INT32_MIN};${INT32_MAX})`,
    requirement: [INT32_MIN, INT32_MAX],
    message,
    '~run'(dataset, config) {
      if (
        dataset.typed &&
        !(dataset.value >= this.requirement[0] && dataset.value <= this.requirement[1])
      ) {
        _addIssue(this, 'int32', dataset, config);
      }
      return dataset;
    },
  };
}