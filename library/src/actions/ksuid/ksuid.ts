import { KSUID_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * KSUID issue interface.
 */
export interface KsuidIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'ksuid';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The KSUID regex.
   */
  readonly requirement: RegExp;
}

/**
 * KSUID action interface.
 */
export interface KsuidAction<
  TInput extends string,
  TMessage extends ErrorMessage<KsuidIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, KsuidIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'ksuid';
  /**
   * The action reference.
   */
  readonly reference: typeof ksuid;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The KSUID regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [KSUID](https://github.com/segmentio/ksuid) validation action.
 *
 * `@returns` A KSUID action.
 */
export function ksuid<TInput extends string>(): KsuidAction<TInput, undefined>;

/**
 * Creates a [KSUID](https://github.com/segmentio/ksuid) validation action.
 *
 * `@param` message The error message.
 *
 * `@returns` A KSUID action.
 */
export function ksuid<
  TInput extends string,
  const TMessage extends ErrorMessage<KsuidIssue<TInput>> | undefined,
>(message: TMessage): KsuidAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function ksuid(
  message?: ErrorMessage<KsuidIssue<string>>
): KsuidAction<string, ErrorMessage<KsuidIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'ksuid',
    reference: ksuid,
    async: false,
    expects: null,
    requirement: KSUID_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'KSUID', dataset, config);
      }
      return dataset;
    },
  };
}
