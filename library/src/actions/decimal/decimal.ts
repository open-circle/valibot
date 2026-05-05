import { DECIMAL_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Decimal issue interface.
 */
export interface DecimalIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'decimal';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The decimal regex.
   */
  readonly requirement: RegExp;
}

/**
 * Decimal action interface.
 */
export interface DecimalAction<
  TInput extends string,
  TMessage extends ErrorMessage<DecimalIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, DecimalIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'decimal';
  /**
   * The action reference.
   */
  readonly reference: typeof decimal;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The decimal regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [decimal](https://en.wikipedia.org/wiki/Decimal) validation action.
 *
 * The difference between `decimal` and `digits` is that `decimal` accepts
 * floating point numbers and negative numbers, while `digits` accepts only the
 * digits 0-9.
 *
 * @returns An decimal action.
 */
export function decimal<TInput extends string>(): DecimalAction<
  TInput,
  undefined
>;

/**
 * Creates a [decimal](https://en.wikipedia.org/wiki/Decimal) validation action.
 *
 * The difference between `decimal` and `digits` is that `decimal` accepts
 * floating point numbers and negative numbers, while `digits` accepts only the
 * digits 0-9.
 *
 * @param message The error message.
 *
 * @returns An decimal action.
 */
export function decimal<
  TInput extends string,
  const TMessage extends ErrorMessage<DecimalIssue<TInput>> | undefined,
>(message: TMessage): DecimalAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function decimal(
  message?: ErrorMessage<DecimalIssue<string>>
): DecimalAction<string, ErrorMessage<DecimalIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'decimal',
    reference: decimal,
    async: false,
    expects: null,
    requirement: DECIMAL_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'decimal', dataset, config);
      }
      return dataset;
    },
  };
}
