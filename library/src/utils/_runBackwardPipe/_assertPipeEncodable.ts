import type {
  GenericPipeItem,
  GenericPipeItemAsync,
} from '../../types/index.ts';

/**
 * Rejects transformations that cannot run backward.
 *
 * @param pipe The pipeline items.
 *
 * @internal
 */
export function _assertPipeEncodable(
  pipe: readonly (GenericPipeItem<unknown> | GenericPipeItemAsync<unknown>)[]
): void {
  for (const item of pipe) {
    if (item.kind !== 'transformation') {
      continue;
    }
    // Type-only actions are identities.
    if (
      item.type === 'brand' ||
      item.type === 'flavor' ||
      item.type === 'readonly'
    ) {
      continue;
    }
    throw new Error(
      `Cannot encode unidirectional transformation: ${item.type}`
    );
  }
}
