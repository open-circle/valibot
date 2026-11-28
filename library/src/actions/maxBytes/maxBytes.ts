import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getByteCount } from '../../utils/index.ts';

/**
 * Max bytes issue interface.
 */
export interface MaxBytesIssue<
  TInput extends string,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'max_bytes';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum bytes.
   */
  readonly requirement: TRequirement;
}

/**
 * Max bytes action interface.
 */
export interface MaxBytesAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    ErrorMessage<MaxBytesIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MaxBytesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'max_bytes';
  /**
   * The action reference.
   */
  readonly reference: typeof maxBytes;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The maximum bytes.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max [bytes](https://en.wikipedia.org/wiki/Byte) validation action.
 *
 * @param requirement The maximum bytes.
 *
 * @returns A max bytes action.
 */
export function maxBytes<
  TInput extends string,
  const TRequirement extends number,
>(requirement: TRequirement): MaxBytesAction<TInput, TRequirement, undefined>;

/**
 * Creates a max [bytes](https://en.wikipedia.org/wiki/Byte) validation action.
 *
 * @param requirement The maximum bytes.
 * @param message The error message.
 *
 * @returns A max bytes action.
 */
export function maxBytes<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<MaxBytesIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxBytesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxBytes(
  requirement: number,
  message?: ErrorMessage<MaxBytesIssue<string, number>>
): MaxBytesAction<
  string,
  number,
  ErrorMessage<MaxBytesIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_bytes',
    reference: maxBytes,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const length = _getByteCount(dataset.value);
        if (length > this.requirement) {
          _addIssue(this, 'bytes', dataset, config, {
            received: `${length}`,
          });
        }
      }
      return dataset;
    },
  };
}
