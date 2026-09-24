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
    const result = textEncoder.encodeInto(
      read ? input.slice(read) : input,
      buffer
    );
    read += result.read;
    count += result.written;
  }
  return count;
}
