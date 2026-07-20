import { IPV4_REGEX, IPV6_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Validates a [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)
 * string: an IPv4 or IPv6 address followed by a `/` and a prefix length in
 * range (0-32 for IPv4, 0-128 for IPv6). See issue #342.
 */
function isCidr(value: string): boolean {
  const slash = value.lastIndexOf('/');
  if (slash < 0) return false;
  const ip = value.slice(0, slash);
  const prefix = value.slice(slash + 1);
  if (!/^\d{1,3}$/.test(prefix)) return false;
  const n = Number(prefix);
  if (IPV4_REGEX.test(ip)) {
    return n >= 0 && n <= 32;
  }
  if (IPV6_REGEX.test(ip)) {
    return n >= 0 && n <= 128;
  }
  return false;
}

/**
 * CIDR issue interface.
 */
export interface CidrIssue<TInput extends string>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'cidr';
  readonly expected: null;
  readonly received: `"${string}"`;
  readonly requirement: (input: string) => boolean;
}

/**
 * CIDR action interface.
 */
export interface CidrAction<
  TInput extends string,
  TMessage extends ErrorMessage<CidrIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, CidrIssue<TInput>> {
  readonly type: 'cidr';
  readonly reference: typeof cidr;
  readonly expects: null;
  readonly requirement: (input: string) => boolean;
  readonly message: TMessage;
}

/**
 * Creates a [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)
 * validation action that accepts both IPv4 (`192.168.1.0/24`) and IPv6
 * (`2001:db8::/32`) CIDR notation. The prefix length must be in range (0-32 for
 * IPv4, 0-128 for IPv6). See issue #342.
 *
 * @returns A CIDR action.
 */
export function cidr<TInput extends string>(): CidrAction<TInput, undefined>;

/**
 * Creates a CIDR validation action.
 *
 * @param message The error message.
 *
 * @returns A CIDR action.
 */
export function cidr<
  TInput extends string,
  const TMessage extends ErrorMessage<CidrIssue<TInput>> | undefined,
>(message: TMessage): CidrAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function cidr(
  message?: ErrorMessage<CidrIssue<string>>,
): CidrAction<string, ErrorMessage<CidrIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'cidr',
    reference: cidr,
    async: false,
    expects: null,
    requirement: isCidr,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'CIDR', dataset, config);
      }
      return dataset;
    },
  };
}