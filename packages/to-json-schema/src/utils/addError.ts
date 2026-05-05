/**
 * Adds an error message to the errors array.
 *
 * @param errors The array of error messages.
 * @param message The error message to add.
 *
 * @returns The new errors.
 */
export function addError(
  errors: [string, ...string[]] | undefined,
  message: string
): [string, ...string[]] {
  if (errors) {
    errors.push(message);
    return errors;
  }
  return [message];
}
