import { BTC_ADDRESS_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import { createHash } from './sha256-uint8array.ts';

/**
 * Simplified Bech32 verification module.
 *
 * This code is based on the Bech32 reference implementation:
 * https://github.com/sipa/bech32/blob/master/ref/javascript/bech32.js
 *
 * Follows the specifications outlined in BIP-0173:
 * https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 *
 * The module provides a function `verify` which verifies if a given
 * Bech32 or Bech32m encoded string has a valid checksum.
 */
const Bech32 = (function () {
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const GENERATOR = [
    0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
  ];

  type Encoding = 'bech32' | 'bech32m';

  function getEncodingConst(enc: Encoding): number {
    return enc === 'bech32' ? 1 : 0x2bc830a3;
  }

  function polymod(values: number[]): number {
    let chk = 1;
    for (let p = 0; p < values.length; ++p) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ values[p];
      for (let i = 0; i < 5; ++i) {
        if ((top >> i) & 1) {
          chk ^= GENERATOR[i];
        }
      }
    }
    return chk;
  }

  function hrpExpand(hrp: string): number[] {
    const ret: number[] = [];
    for (let p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) >> 5);
    }
    ret.push(0);
    for (let p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) & 31);
    }
    return ret;
  }

  function verifyChecksum(hrp: string, data: number[], enc: Encoding): boolean {
    return polymod(hrpExpand(hrp).concat(data)) === getEncodingConst(enc);
  }

  function verify(bechString: string, enc: Encoding): boolean {
    let has_lower = false,
      has_upper = false;
    for (let p = 0; p < bechString.length; ++p) {
      const c = bechString.charCodeAt(p);
      if (c < 33 || c > 126) return false;
      if (c >= 97 && c <= 122) has_lower = true;
      if (c >= 65 && c <= 90) has_upper = true;
    }
    if (has_lower && has_upper) return false;

    bechString = bechString.toLowerCase();
    const pos = bechString.lastIndexOf('1');
    if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90)
      return false;

    const hrp = bechString.substring(0, pos);
    const data: number[] = [];
    for (let p = pos + 1; p < bechString.length; ++p) {
      const d = CHARSET.indexOf(bechString.charAt(p));
      if (d === -1) return false;
      data.push(d);
    }
    return verifyChecksum(hrp, data, enc);
  }
  return { verify };
})();
const Base58 = (function () {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  /**
   * Converts a Base58-encoded string to a Uint8Array.
   *
   * @param base58 - The Base58 string to convert.
   *
   * @returns A Uint8Array representing the binary data.
   *
   * @throws Will throw an error if the input is not a valid Base58 string.
   */
  function toBinary(base58: string) {
    const base = 58;
    const bytes = [0];

    for (const char of base58) {
      const value = alphabet.indexOf(char);
      if (value === -1) {
        throw new Error('Invalid Base58 character');
      }

      let carry = value;
      for (let i = 0; i < bytes.length; i++) {
        carry += bytes[i] * base;
        bytes[i] = carry & 0xff;
        carry >>= 8;
      }

      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }

    // Handle leading zeroes
    for (const char of base58) {
      if (char !== '1') break;
      bytes.push(0);
    }

    return new Uint8Array(bytes.reverse());
  }

  return { toBinary };
})();
function sha256(payload: string | Uint8Array) {
  // @ts-ignore
  return createHash().update(payload).digest();
}

/**
 * BTC address issue type.
 */
export interface BTCAddressIssue<TInput extends string>
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
  readonly received: string;
}

/**
 * BTC address validation action type.
 */
export interface BTCAddressAction<
  TInput extends string,
  TMessage extends ErrorMessage<BTCAddressIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, BTCAddressIssue<TInput>> {
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
   * The error message.
   */
  readonly message: TMessage;
  /**
   * The validation function.
   */
  readonly requirement: (address: string) => boolean;
}

/**
 * Creates a BTC address validation action.
 *
 * @returns A BTC address validation action.
 */
export function btcAddress<TInput extends string>(): BTCAddressAction<
  TInput,
  undefined
>;

/**
 * Creates a BTC address validation action.
 *
 * @param message The error message.
 *
 * @returns A BTC address validation action.
 */
export function btcAddress<
  TInput extends string,
  const TMessage extends ErrorMessage<BTCAddressIssue<TInput>> | undefined,
>(message: TMessage): BTCAddressAction<TInput, TMessage>;

export function btcAddress<TInput extends string>(
  message?: ErrorMessage<BTCAddressIssue<TInput>>
): BTCAddressAction<TInput, ErrorMessage<BTCAddressIssue<TInput>> | undefined> {
  return {
    async: false,
    kind: 'validation',
    type: 'btc_address',
    reference: btcAddress,
    expects: null,
    message,

    requirement(address) {
      if (!BTC_ADDRESS_REGEX.test(address)) return false;
      if (
        address.toLowerCase().startsWith('bc1') ||
        address.toLowerCase().startsWith('tb1')
      ) {
        return address.startsWith('bc1p') || address.startsWith('tb1p')
          ? Bech32.verify(address, 'bech32m')
          : Bech32.verify(address, 'bech32');
      }

      // Validate Base58 address
      try {
        const decoded = Base58.toBinary(address);
        if (decoded.length !== 25) {
          return false;
        }

        // Verify checksum
        const checksum = decoded.slice(-4);
        const body = decoded.slice(0, -4);
        const expectedChecksum = sha256(sha256(body)).slice(0, 4);

        if (
          checksum.some((value, index) => value !== expectedChecksum[index])
        ) {
          return false;
        }

        // Verify version byte
        const version = decoded[0];
        const validVersions = [0x00, 0x05, 0x6f, 0xc4];
        return validVersions.includes(version);
      } catch {
        return false;
      }
    },
    '~validate'(dataset, config) {
      if (dataset.typed) {
        if (dataset.typed && !this.requirement(dataset.value)) {
          _addIssue(this, 'btc address', dataset, config);
        }
      }
      return dataset;
    },
  };
}
