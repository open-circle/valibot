import { BTC_ADDRESS_BECH32_REGEX } from '../../regex.ts';
import { _isBech32, BECH32_CHARSET } from '../_isBech32/index.ts';

/**
 * Bitcoin Bech32 human readable parts.
 */
const BITCOIN_BECH32_HRPS = ['bc', 'tb'] as const;

/**
 * Converts bits.
 *
 * @param data The data values.
 * @param from The source bit group size.
 * @param to The target bit group size.
 *
 * @returns The converted bits.
 */
// @__NO_SIDE_EFFECTS__
function convertBits(
  data: readonly number[],
  from: number,
  to: number
): number[] | null {
  let accumulator = 0;
  let bits = 0;
  const result: number[] = [];
  const maxValue = (1 << to) - 1;
  const maxAccumulator = (1 << (from + to - 1)) - 1;

  for (const value of data) {
    accumulator = ((accumulator << from) | value) & maxAccumulator;
    bits += from;

    while (bits >= to) {
      bits -= to;
      result.push((accumulator >> bits) & maxValue);
    }
  }

  if (bits >= from || ((accumulator << (to - bits)) & maxValue) !== 0) {
    return null;
  }

  return result;
}

/**
 * Gets the Bitcoin witness version.
 *
 * @param input The Bitcoin Bech32 address.
 *
 * @returns The Bitcoin witness version.
 */
// @__NO_SIDE_EFFECTS__
function getWitnessVersion(input: string): number {
  const normalized = input.toLowerCase();
  const separator = normalized.lastIndexOf('1');
  return BECH32_CHARSET.indexOf(normalized[separator + 1]);
}

/**
 * Checks if Bech32 data is a valid Bitcoin witness payload.
 *
 * @param data The Bech32 data.
 *
 * @returns Whether the Bech32 data is a valid Bitcoin witness payload.
 */
// @__NO_SIDE_EFFECTS__
function isBitcoinWitnessPayload(data: readonly number[]): boolean {
  const program = convertBits(data.slice(1), 5, 8);

  return !!(
    program &&
    program.length >= 2 &&
    program.length <= 40 &&
    (data[0] !== 0 || program.length === 20 || program.length === 32)
  );
}

/**
 * Checks if a string is a Bitcoin Bech32 or Bech32m address.
 *
 * @param input The string input.
 *
 * @returns Whether the string is a Bitcoin Bech32 or Bech32m address.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isBtcAddressBech32(input: string): boolean {
  if (!BTC_ADDRESS_BECH32_REGEX.test(input)) {
    return false;
  }

  const witnessVersion = getWitnessVersion(input);

  if (witnessVersion < 0 || witnessVersion > 16) {
    return false;
  }

  return _isBech32(
    input,
    BITCOIN_BECH32_HRPS,
    witnessVersion === 0 ? 'bech32' : 'bech32m',
    isBitcoinWitnessPayload
  );
}
