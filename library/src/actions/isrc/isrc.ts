import { ISRC_REGEX } from '../../regex.ts';
import type { BaseIssue, BaseValidation, ErrorMessage } from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISRC issue interface.
 */
export interface IsrcIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'isrc';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The validation function.
   */
  readonly requirement: RegExp;
}

/**
 * ISRC action interface.
 */
export interface IsrcAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsrcIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsrcIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'isrc';
  /**
   * The action reference.
   */
  readonly reference: typeof isrc;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISRC](https://en.wikipedia.org/wiki/International_Standard_Recording_Code) validation action.
 *
 * Formats:
 * - AAXXXYYNNNNN
 * - AA-XXX-YY-NNNNN
 *
 * @returns An ISRC action.
 */
export function isrc<TInput extends string>(): IsrcAction<TInput, undefined>;

/**
 * Creates an [ISRC](https://en.wikipedia.org/wiki/International_Standard_Recording_Code) validation action.
 *
 * @param message The error message.
 *
 * @returns An ISRC action.
 */
export function isrc<
  TInput extends string,
  const TMessage extends ErrorMessage<IsrcIssue<TInput>> | undefined,
>(message: TMessage): IsrcAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isrc(
  message?: ErrorMessage<IsrcIssue<string>>
): IsrcAction<string, ErrorMessage<IsrcIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'isrc',
    reference: isrc,
    async: false,
    expects: null,
    requirement: ISRC_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'ISRC', dataset, config);
      }
      return dataset;
    },
  };
}
