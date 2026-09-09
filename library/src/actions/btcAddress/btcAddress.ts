import { BTC_ADDRESS_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import {
  _addIssue,
  _isBtcAddressBase58,
  _isBtcAddressBech32,
} from '../../utils/index.ts';

/**
 * Bitcoin address issue interface.
 */
export interface BtcAddressIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'btc_address';
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
  readonly requirement: (input: string) => boolean;
}

/**
 * Bitcoin address action interface.
 */
export interface BtcAddressAction<
  TInput extends string,
  TMessage extends ErrorMessage<BtcAddressIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, BtcAddressIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'btc_address';
  /**
   * The action reference.
   */
  readonly reference: typeof btcAddress;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [Bitcoin address](https://en.bitcoin.it/wiki/Address) validation action.
 *
 * @returns A Bitcoin address action.
 */
export function btcAddress<TInput extends string>(): BtcAddressAction<
  TInput,
  undefined
>;

/**
 * Creates a [Bitcoin address](https://en.bitcoin.it/wiki/Address) validation action.
 *
 * @param message The error message.
 *
 * @returns A Bitcoin address action.
 */
export function btcAddress<
  TInput extends string,
  const TMessage extends ErrorMessage<BtcAddressIssue<TInput>> | undefined,
>(message: TMessage): BtcAddressAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function btcAddress(
  message?: ErrorMessage<BtcAddressIssue<string>>
): BtcAddressAction<string, ErrorMessage<BtcAddressIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'btc_address',
    reference: btcAddress,
    async: false,
    expects: null,
    requirement(input) {
      return (
        BTC_ADDRESS_REGEX.test(input) &&
        (_isBtcAddressBase58(input) || _isBtcAddressBech32(input))
      );
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'Bitcoin address', dataset, config);
      }
      return dataset;
    },
  };
}
