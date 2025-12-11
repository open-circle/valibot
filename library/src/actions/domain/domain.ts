import { DOMAIN_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Domain issue interface.
 */
export interface DomainIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'domain';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The domain regex.
   */
  readonly requirement: RegExp;
}

/**
 * Domain action interface.
 */
export interface DomainAction<
  TInput extends string,
  TMessage extends ErrorMessage<DomainIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, DomainIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'domain';
  /**
   * The action reference.
   */
  readonly reference: typeof domain;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The domain regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a domain name validation action.
 *
 * Hint: Hint: ASCII-only validation. 
 * Internationalized domain names (IDN) not supported (including their Punycode form).
 *
 * @returns A domain action.
 */
export function domain<TInput extends string>(): DomainAction<
  TInput,
  undefined
>;

/**
 * Creates a domain name validation action.
 *
 * @param message The error message.
 *
 * @returns A domain action.
 */
export function domain<
  TInput extends string,
  const TMessage extends ErrorMessage<DomainIssue<TInput>> | undefined,
>(message: TMessage): DomainAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function domain(
  message?: ErrorMessage<DomainIssue<string>>
): DomainAction<string, ErrorMessage<DomainIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'domain',
    reference: domain,
    expects: null,
    async: false,
    requirement: DOMAIN_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'domain', dataset, config);
      }
      return dataset;
    },
  };
}
