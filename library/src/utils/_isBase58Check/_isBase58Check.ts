import { sha256 } from '@noble/hashes/sha2.js';

/**
 * Base58 alphabet.
 */
const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Checks if a string is a Base58Check encoded value.
 *
 * @param input The string input.
 * @param versions The valid version bytes.
 *
 * @returns Whether the string is a Base58Check encoded value.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isBase58Check(
  input: string,
  versions: readonly number[]
): boolean {
  const bytes = [0];

  for (const char of input) {
    const value = BASE58_ALPHABET.indexOf(char);

    if (value === -1) {
      return false;
    }

    let carry = value;
    for (let index = 0; index < bytes.length; index++) {
      carry += bytes[index] * 58;
      bytes[index] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (const char of input) {
    if (char !== '1') {
      break;
    }
    bytes.push(0);
  }

  const decoded = new Uint8Array(bytes.reverse());

  if (decoded.length !== 25 || !versions.includes(decoded[0])) {
    return false;
  }

  const body = decoded.slice(0, -4);
  const checksum = decoded.slice(-4);
  const expectedChecksum = sha256(sha256(body)).slice(0, 4);

  return checksum.every((value, index) => value === expectedChecksum[index]);
}
