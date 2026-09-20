import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _joinExpects } from '../../utils/index.ts';

/**
 * Requirement type.
 */
type Requirement = readonly `${string}/${string}`[];

/**
 * MIME type issue interface.
 */
export interface MimeTypeIssue<
  TInput extends Blob,
  TRequirement extends Requirement,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'mime_type';
  /**
   * The expected input.
   */
  readonly expected: string;
  /**
   * The received input.
   */
  readonly received: `"${string}"`;
  /**
   * The MIME types.
   */
  readonly requirement: TRequirement;
}

/**
 * MIME type action interface.
 */
export interface MimeTypeAction<
  TInput extends Blob,
  TRequirement extends Requirement,
  TMessage extends
    ErrorMessage<MimeTypeIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MimeTypeIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'mime_type';
  /**
   * The action reference.
   */
  readonly reference: typeof mimeType;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The MIME types.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [MIME type](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types) validation action.
 *
 * @param requirement The MIME types.
 *
 * @returns A MIME type action.
 */
export function mimeType<
  TInput extends Blob,
  const TRequirement extends Requirement,
>(requirement: TRequirement): MimeTypeAction<TInput, TRequirement, undefined>;

/**
 * Creates a [MIME type](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types) validation action.
 *
 * @param requirement The MIME types.
 * @param message The error message.
 *
 * @returns A MIME type action.
 */
export function mimeType<
  TInput extends Blob,
  const TRequirement extends Requirement,
  const TMessage extends
    ErrorMessage<MimeTypeIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MimeTypeAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function mimeType(
  requirement: Requirement,
  message?: ErrorMessage<MimeTypeIssue<Blob, Requirement>>
): MimeTypeAction<
  Blob,
  Requirement,
  ErrorMessage<MimeTypeIssue<Blob, Requirement>> | undefined
> {
  return {
    kind: 'validation',
    type: 'mime_type',
    reference: mimeType,
    async: false,
    expects: _joinExpects(
      requirement.map((option) => `"${option}"`),
      '|'
    ),
    requirement,
    message,
    '~run'(dataset, config) {
      if (
        dataset.typed &&
        !this.requirement.includes(dataset.value.type as `${string}/${string}`)
      ) {
        _addIssue(this, 'MIME type', dataset, config, {
          received: `"${dataset.value.type}"`,
        });
      }
      return dataset;
    },
  };
}
