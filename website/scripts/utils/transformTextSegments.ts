/**
 * Splits Markdown content on fenced code blocks and applies the transform
 * only to the text segments outside of them. Can also be used to inspect
 * text segments by returning them unchanged.
 *
 * @param content The Markdown content to transform.
 * @param transform The transform to apply to text segments.
 *
 * @returns The transformed Markdown content.
 */
export function transformTextSegments(
  content: string,
  transform: (segment: string) => string
): string {
  return content
    .split(/(```[\s\S]*?```)/)
    .map((segment) =>
      segment.startsWith('```') ? segment : transform(segment)
    )
    .join('');
}
