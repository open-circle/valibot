/**
 * Encodes a string as a JSON Pointer reference token per RFC 6901.
 *
 * The two characters that must be escaped are:
 * - `~` → `~0`
 * - `/` → `~1`
 *
 * @param token The token to encode.
 *
 * @returns The encoded token.
 */
export function encodePointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}
