import { JWS_COMPACT_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * JWS compact issue interface.
 *
 * @beta
 */
export interface JwsCompactIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'jws_compact';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The JWS compact regex.
   */
  readonly requirement: RegExp;
}

/**
 * JWS compact action interface.
 *
 * @beta
 */
export interface JwsCompactAction<
  TInput extends string,
  TMessage extends ErrorMessage<JwsCompactIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, JwsCompactIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'jws_compact';
  /**
   * The action reference.
   */
  readonly reference: typeof jwsCompact;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The JWS compact regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [JWS compact serialization](https://datatracker.ietf.org/doc/html/rfc7515#section-3.1)
 * validation action.
 *
 * Hint: This validation action only checks the three-part compact string shape
 * with unpadded Base64URL-like segments. It does not decode the segments,
 * verify the signature, or validate claims.
 *
 * @returns A JWS compact action.
 *
 * @beta
 */
export function jwsCompact<TInput extends string>(): JwsCompactAction<
  TInput,
  undefined
>;

/**
 * Creates a [JWS compact serialization](https://datatracker.ietf.org/doc/html/rfc7515#section-3.1)
 * validation action.
 *
 * Hint: This validation action only checks the three-part compact string shape
 * with unpadded Base64URL-like segments. It does not decode the segments,
 * verify the signature, or validate claims.
 *
 * @param message The error message.
 *
 * @returns A JWS compact action.
 *
 * @beta
 */
export function jwsCompact<
  TInput extends string,
  const TMessage extends ErrorMessage<JwsCompactIssue<TInput>> | undefined,
>(message: TMessage): JwsCompactAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function jwsCompact(
  message?: ErrorMessage<JwsCompactIssue<string>>
): JwsCompactAction<string, ErrorMessage<JwsCompactIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'jws_compact',
    reference: jwsCompact,
    async: false,
    expects: null,
    requirement: JWS_COMPACT_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'JWS compact', dataset, config);
      }
      return dataset;
    },
  };
}
