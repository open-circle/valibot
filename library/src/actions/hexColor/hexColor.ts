import { HEX_COLOR_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Hex color issue interface.
 */
export interface HexColorIssue<
  TInput extends string,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'hex_color';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The hex color regex.
   */
  readonly requirement: RegExp;
}

/**
 * Hex color action interface.
 */
export interface HexColorAction<
  TInput extends string,
  TMessage extends ErrorMessage<HexColorIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, HexColorIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'hex_color';
  /**
   * The action reference.
   */
  readonly reference: typeof hexColor;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The hex color regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [hex color](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) validation action.
 *
 * @returns A hex color action.
 */
export function hexColor<TInput extends string>(): HexColorAction<
  TInput,
  undefined
>;

/**
 * Creates a [hex color](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) validation action.
 *
 * @param message The error message.
 *
 * @returns A hex color action.
 */
export function hexColor<
  TInput extends string,
  const TMessage extends ErrorMessage<HexColorIssue<TInput>> | undefined,
>(message: TMessage): HexColorAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function hexColor(
  message?: ErrorMessage<HexColorIssue<string>>
): HexColorAction<string, ErrorMessage<HexColorIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'hex_color',
    reference: hexColor,
    async: false,
    expects: null,
    requirement: HEX_COLOR_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'hex color', dataset, config);
      }
      return dataset;
    },
  };
}
