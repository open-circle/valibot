/**
 * Checks whether a pipe item requires an input without prior issues.
 *
 * @param item The pipe item.
 * @param item.kind The kind of pipe item.
 * @param item.type The type of pipe item.
 *
 * @returns Whether the item is a schema or can run a transformation.
 *
 * @internal
 */
export function _isTransformationBoundary(item: {
  readonly kind: string;
  readonly type: string;
}): boolean {
  return (
    item.kind === 'schema' ||
    item.kind === 'transformation' ||
    (item.kind === 'validation' &&
      item.type === 'any_of' &&
      'options' in item &&
      Array.isArray(item.options) &&
      item.options.some(_isTransformationBoundary))
  );
}
