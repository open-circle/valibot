import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getByteCount } from '../../utils/index.ts';

/**
 * Not bytes issue interface.
 */
export interface NotBytesIssue<
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
  readonly type: 'not_bytes';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The not required bytes.
   */
  readonly requirement: TRequirement;
}

/**
 * Not bytes action interface.
 */
export interface NotBytesAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<NotBytesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, NotBytesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'not_bytes';
  /**
   * The action reference.
   */
  readonly reference: typeof notBytes;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The not required bytes.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not [bytes](https://en.wikipedia.org/wiki/Byte) validation action.
 *
 * @param requirement The not required bytes.
 *
 * @returns A not bytes action.
 */
export function notBytes<
  TInput extends string,
  const TRequirement extends number,
>(requirement: TRequirement): NotBytesAction<TInput, TRequirement, undefined>;

/**
 * Creates a not [bytes](https://en.wikipedia.org/wiki/Byte) validation action.
 *
 * @param requirement The not required bytes.
 * @param message The error message.
 *
 * @returns A not bytes action.
 */
export function notBytes<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<NotBytesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotBytesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notBytes(
  requirement: number,
  message?: ErrorMessage<NotBytesIssue<string, number>>
): NotBytesAction<
  string,
  number,
  ErrorMessage<NotBytesIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_bytes',
    reference: notBytes,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        if (dataset.value.length <= this.requirement) {
          const length = _getByteCount(dataset.value);
          if (length === this.requirement) {
            _addIssue(this, 'bytes', dataset, config, {
              received: `${length}`,
            });
          }
        }
      }
      return dataset;
    },
  };
}
