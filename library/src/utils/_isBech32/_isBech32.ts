/**
 * Bech32 checksum encoding type.
 */
export type Bech32Encoding = 'bech32' | 'bech32m';

/**
 * Bech32 charset.
 */
export const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

/**
 * Bech32 generator.
 */
const BECH32_GENERATOR = [
  0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
];

/**
 * Gets the Bech32 checksum constant.
 *
 * @param encoding The Bech32 encoding.
 *
 * @returns The Bech32 checksum constant.
 */
// @__NO_SIDE_EFFECTS__
function getChecksumConstant(encoding: Bech32Encoding): number {
  return encoding === 'bech32' ? 1 : 0x2bc830a3;
}

/**
 * Calculates the Bech32 polymod checksum.
 *
 * @param values The checksum values.
 *
 * @returns The Bech32 polymod checksum.
 */
// @__NO_SIDE_EFFECTS__
function getPolymod(values: readonly number[]): number {
  let checksum = 1;

  for (const value of values) {
    const top = checksum >> 25;
    checksum = ((checksum & 0x1ffffff) << 5) ^ value;

    for (let index = 0; index < 5; index++) {
      if ((top >> index) & 1) {
        checksum ^= BECH32_GENERATOR[index];
      }
    }
  }

  return checksum;
}

/**
 * Expands a Bech32 human readable part.
 *
 * @param hrp The human readable part.
 *
 * @returns The expanded human readable part.
 */
// @__NO_SIDE_EFFECTS__
function expandHrp(hrp: string): number[] {
  const expanded: number[] = [];

  for (let index = 0; index < hrp.length; index++) {
    expanded.push(hrp.charCodeAt(index) >> 5);
  }

  expanded.push(0);

  for (let index = 0; index < hrp.length; index++) {
    expanded.push(hrp.charCodeAt(index) & 31);
  }

  return expanded;
}

/**
 * Checks if a string is Bech32 encoded.
 *
 * @param input The string input.
 * @param hrps The valid human readable parts.
 * @param encoding The Bech32 checksum encoding.
 * @param requirement The optional data requirement.
 *
 * @returns Whether the string is Bech32 encoded.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isBech32(
  input: string,
  hrps: readonly string[],
  encoding: Bech32Encoding,
  requirement?: (data: readonly number[]) => boolean
): boolean {
  let hasLower = false;
  let hasUpper = false;

  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index);

    if (code < 33 || code > 126) {
      return false;
    }

    if (code >= 97 && code <= 122) {
      hasLower = true;
    }

    if (code >= 65 && code <= 90) {
      hasUpper = true;
    }
  }

  if (hasLower && hasUpper) {
    return false;
  }

  const normalized = input.toLowerCase();
  const separator = normalized.lastIndexOf('1');

  if (
    separator < 1 ||
    separator + 7 > normalized.length ||
    normalized.length > 90
  ) {
    return false;
  }

  const hrp = normalized.slice(0, separator);

  if (!hrps.includes(hrp)) {
    return false;
  }

  const data: number[] = [];

  for (let index = separator + 1; index < normalized.length; index++) {
    const value = BECH32_CHARSET.indexOf(normalized[index]);

    if (value === -1) {
      return false;
    }

    data.push(value);
  }

  const payload = data.slice(0, -6);

  return (
    getPolymod([...expandHrp(hrp), ...data]) ===
      getChecksumConstant(encoding) &&
    (!requirement || requirement(payload))
  );
}
