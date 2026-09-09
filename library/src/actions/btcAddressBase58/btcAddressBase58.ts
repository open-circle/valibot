import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _isBtcAddressBase58 } from '../../utils/index.ts';

/**
 * Bitcoin Base58 address issue interface.
 */
export interface BtcAddressBase58Issue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'btc_address_base58';
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
 * Bitcoin Base58 address action interface.
 */
export interface BtcAddressBase58Action<
  TInput extends string,
  TMessage extends ErrorMessage<BtcAddressBase58Issue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, BtcAddressBase58Issue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'btc_address_base58';
  /**
   * The action reference.
   */
  readonly reference: typeof btcAddressBase58;
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
 * Creates a [Bitcoin Base58Check address](https://en.bitcoin.it/wiki/Base58Check_encoding) validation action.
 *
 * @returns A Bitcoin Base58 address action.
 */
export function btcAddressBase58<
  TInput extends string,
>(): BtcAddressBase58Action<TInput, undefined>;

/**
 * Creates a [Bitcoin Base58Check address](https://en.bitcoin.it/wiki/Base58Check_encoding) validation action.
 *
 * @param message The error message.
 *
 * @returns A Bitcoin Base58 address action.
 */
export function btcAddressBase58<
  TInput extends string,
  const TMessage extends
    | ErrorMessage<BtcAddressBase58Issue<TInput>>
    | undefined,
>(message: TMessage): BtcAddressBase58Action<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function btcAddressBase58(
  message?: ErrorMessage<BtcAddressBase58Issue<string>>
): BtcAddressBase58Action<
  string,
  ErrorMessage<BtcAddressBase58Issue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'btc_address_base58',
    reference: btcAddressBase58,
    async: false,
    expects: null,
    requirement: _isBtcAddressBase58,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'Bitcoin Base58 address', dataset, config);
      }
      return dataset;
    },
  };
}
