import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _isBtcAddressBech32 } from '../../utils/index.ts';

/**
 * Bitcoin Bech32 address issue interface.
 */
export interface BtcAddressBech32Issue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'btc_address_bech32';
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
 * Bitcoin Bech32 address action interface.
 */
export interface BtcAddressBech32Action<
  TInput extends string,
  TMessage extends ErrorMessage<BtcAddressBech32Issue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, BtcAddressBech32Issue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'btc_address_bech32';
  /**
   * The action reference.
   */
  readonly reference: typeof btcAddressBech32;
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
 * Creates a [Bitcoin Bech32 address](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) validation action.
 *
 * @returns A Bitcoin Bech32 address action.
 */
export function btcAddressBech32<
  TInput extends string,
>(): BtcAddressBech32Action<TInput, undefined>;

/**
 * Creates a [Bitcoin Bech32 address](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) validation action.
 *
 * @param message The error message.
 *
 * @returns A Bitcoin Bech32 address action.
 */
export function btcAddressBech32<
  TInput extends string,
  const TMessage extends
    | ErrorMessage<BtcAddressBech32Issue<TInput>>
    | undefined,
>(message: TMessage): BtcAddressBech32Action<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function btcAddressBech32(
  message?: ErrorMessage<BtcAddressBech32Issue<string>>
): BtcAddressBech32Action<
  string,
  ErrorMessage<BtcAddressBech32Issue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'btc_address_bech32',
    reference: btcAddressBech32,
    async: false,
    expects: null,
    requirement: _isBtcAddressBech32,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'Bitcoin Bech32 address', dataset, config);
      }
      return dataset;
    },
  };
}
