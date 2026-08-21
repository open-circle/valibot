/**
 * Gets the number of decimal places of a number.
 *
 * @param value The number to check.
 *
 * @returns The number of decimal places.
 *
 * @internal
 */
export function _getDecimalPlaces(value: number): number {
  const valueAsString = Math.abs(value).toString();
  const eIndex = valueAsString.indexOf('e');
  const dotIndex = valueAsString.indexOf('.');

  if (dotIndex === -1 && eIndex === -1) {
    return 0;
  }

  const coefficient = eIndex !== -1 ? valueAsString.slice(0, eIndex) : valueAsString;
  const exponent = eIndex !== -1 ? valueAsString.slice(eIndex + 1) : undefined;
  const dotIndexInCoefficient = coefficient.indexOf('.');
  const decimalPlaces =
    dotIndexInCoefficient !== -1
      ? coefficient.length - dotIndexInCoefficient - 1
      : 0;

  if (!exponent) {
    return decimalPlaces;
  }

  return Math.max(0, decimalPlaces - Number(exponent));
}
