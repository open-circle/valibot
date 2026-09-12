/**
 * Utilities to modify the headers of responses served by our Worker.
 */

/**
 * Sets a header on the given headers object. Appends the value to multi-value
 * headers (e.g. `Vary` and `Link`) to not overwrite existing values.
 *
 * @param headers The headers object to modify.
 * @param key The key of the header.
 * @param value The value of the header.
 */
export function setHeader(headers: Headers, key: string, value: string): void {
  const lowerKey = key.toLowerCase();
  const prevValue = headers.get(key);
  if (prevValue && (lowerKey === 'vary' || lowerKey === 'link')) {
    const isDuplicate = prevValue
      .split(',')
      .some((part) => part.trim().toLowerCase() === value.toLowerCase());
    if (!isDuplicate) {
      headers.append(key, value);
    }
  } else {
    headers.set(key, value);
  }
}

/**
 * Copies a response and adds the given headers to it.
 *
 * @param response The response to copy.
 * @param headers The headers to add.
 *
 * @returns The new response.
 */
export function withHeaders(
  response: Response,
  headers: Record<string, string>
): Response {
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) {
    setHeader(newResponse.headers, key, value);
  }
  return newResponse;
}
