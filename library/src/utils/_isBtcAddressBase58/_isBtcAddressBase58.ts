import { BTC_ADDRESS_BASE58_REGEX } from '../../regex.ts';
import { _isBase58Check } from '../_isBase58Check/index.ts';

/**
 * Bitcoin Base58Check version bytes.
 */
const BITCOIN_BASE58_VERSIONS = [0x00, 0x05, 0x6f, 0xc4] as const;

/**
 * Checks if a string is a Bitcoin Base58Check address.
 *
 * @param input The string input.
 *
 * @returns Whether the string is a Bitcoin Base58Check address.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isBtcAddressBase58(input: string): boolean {
  return (
    BTC_ADDRESS_BASE58_REGEX.test(input) &&
    _isBase58Check(input, BITCOIN_BASE58_VERSIONS)
  );
}
