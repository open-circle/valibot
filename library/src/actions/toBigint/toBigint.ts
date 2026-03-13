import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * To bigint issue interface.
 */
export interface ToBigintIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'to_bigint';
  /**
   * The expected property.
   */
  readonly expected: null;
}

/**
 * To bigint action interface.
 */
export interface ToBigintAction<
  TInput,
  TMessage extends ErrorMessage<ToBigintIssue<TInput>> | undefined,
> extends BaseTransformation<TInput, bigint, ToBigintIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'to_bigint';
  /**
   * The action reference.
   */
  readonly reference: typeof toBigint;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a to bigint transformation action.
 *
 * @returns A to bigint action.
 *
 * @beta
 */
export function toBigint<TInput>(): ToBigintAction<TInput, undefined>;

/**
 * Creates a to bigint transformation action.
 *
 * @param message The error message.
 *
 * @returns A to bigint action.
 *
 * @beta
 */
export function toBigint<
  TInput,
  const TMessage extends ErrorMessage<ToBigintIssue<TInput>> | undefined,
>(message: TMessage): ToBigintAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function toBigint(
  message?: ErrorMessage<ToBigintIssue<unknown>>
): ToBigintAction<unknown, ErrorMessage<ToBigintIssue<unknown>> | undefined> {
  return {
    kind: 'transformation',
    type: 'to_bigint',
    reference: toBigint,
    async: false,
    message,
    '~run'(dataset, config) {
      try {
        // @ts-expect-error
        dataset.value = BigInt(dataset.value);
      } catch {
        _addIssue(this, 'bigint', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }
      return dataset as OutputDataset<bigint, ToBigintIssue<unknown>>;
    },
  };
}
