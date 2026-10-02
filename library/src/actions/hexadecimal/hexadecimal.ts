import { HEXADECIMAL_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Hexadecimal issue interface.
 */
export interface HexadecimalIssue<
  TInput extends string,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'hexadecimal';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The hexadecimal regex.
   */
  readonly requirement: RegExp;
}

/**
 * Hexadecimal action interface.
 */
export interface HexadecimalAction<
  TInput extends string,
  TMessage extends ErrorMessage<HexadecimalIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, HexadecimalIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'hexadecimal';
  /**
   * The action reference.
   */
  readonly reference: typeof hexadecimal;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The hexadecimal regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) validation action.
 *
 * @returns A hexadecimal action.
 */
export function hexadecimal<TInput extends string>(): HexadecimalAction<
  TInput,
  undefined
>;

/**
 * Creates a [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) validation action.
 *
 * @param message The error message.
 *
 * @returns A hexadecimal action.
 */
export function hexadecimal<
  TInput extends string,
  const TMessage extends ErrorMessage<HexadecimalIssue<TInput>> | undefined,
>(message: TMessage): HexadecimalAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function hexadecimal(
  message?: ErrorMessage<HexadecimalIssue<string>>
): HexadecimalAction<
  string,
  ErrorMessage<HexadecimalIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'hexadecimal',
    reference: hexadecimal,
    async: false,
    expects: null,
    requirement: HEXADECIMAL_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'hexadecimal', dataset, config);
      }
      return dataset;
    },
  };
}
