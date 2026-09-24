let textEncoder: TextEncoder;
let buffer: Uint8Array;

/**
 * Returns the byte count of the input.
 *
 * @param input The input to be measured.
 *
 * @returns The byte count.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getByteCount(input: string): number {
  if (!textEncoder) {
    textEncoder = new TextEncoder();
    // Hint: A small fixed-size buffer is reused for all inputs to avoid
    // allocating a new byte array on every call while keeping memory usage
    // constant regardless of the input length
    buffer = new Uint8Array(4096);
  }
  let count = 0;
  let read = 0;
  // Hint: Inputs that do not fit into the buffer are encoded in chunks. The
  // encoder never splits a surrogate pair, so each chunk starts at a code
  // point boundary.
  while (read < input.length) {
    // Hint: Each code unit takes at least one byte, so a chunk longer than the
    // buffer can never be fully read. Bounding the slice avoids copying the
    // entire rest of the input on every chunk in engines where slices are not
    // shared, like JavaScriptCore. A surrogate pair split at the end of the
    // slice is never encoded, because the preceding code units fill all but at
    // most one byte of the buffer.
    const result = textEncoder.encodeInto(
      read || input.length > buffer.length
        ? input.slice(read, read + buffer.length)
        : input,
      buffer
    );
    read += result.read;
    count += result.written;
  }
  return count;
}
