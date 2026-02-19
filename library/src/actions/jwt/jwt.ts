import { JWT_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * JWT issue interface.
 */
export interface JwtIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'jwt';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The JWT regex.
   */
  readonly requirement: RegExp;
}

/**
 * JWT action interface.
 */
export interface JwtAction<
  TInput extends string,
  TMessage extends ErrorMessage<JwtIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, JwtIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'jwt';
  /**
   * The action reference.
   */
  readonly reference: typeof jwt;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The JWT regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) validation action.
 *
 * @returns A JWT action.
 */
export function jwt<TInput extends string>(): JwtAction<TInput, undefined>;

/**
 * Creates a [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) validation action.
 *
 * @param message The error message.
 *
 * @returns A JWT action.
 */
export function jwt<
  TInput extends string,
  const TMessage extends ErrorMessage<JwtIssue<TInput>> | undefined,
>(message: TMessage): JwtAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function jwt(
  message?: ErrorMessage<JwtIssue<string>>
): JwtAction<string, ErrorMessage<JwtIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'jwt',
    reference: jwt,
    async: false,
    expects: null,
    requirement: JWT_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'JWT', dataset, config);
      }
      return dataset;
    },
  };
}
