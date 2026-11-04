import type {
  GenericPipeItem,
  GenericPipeItemAsync,
  GenericSchema,
  GenericSchemaAsync,
} from '../../types/index.ts';

/**
 * Finds the last schema before a pipeline position.
 *
 * @param pipe The pipeline items.
 * @param beforeIndex The exclusive upper search bound.
 *
 * @returns The preceding schema, if any.
 *
 * @internal
 */
export function _getPreviousSchema(
  pipe: readonly GenericPipeItem<unknown>[],
  beforeIndex: number
): GenericSchema | undefined;

export function _getPreviousSchema(
  pipe: readonly (GenericPipeItem<unknown> | GenericPipeItemAsync<unknown>)[],
  beforeIndex: number
): GenericSchema | GenericSchemaAsync | undefined;

export function _getPreviousSchema(
  pipe: readonly (GenericPipeItem<unknown> | GenericPipeItemAsync<unknown>)[],
  beforeIndex: number
): GenericSchema | GenericSchemaAsync | undefined {
  for (let index = beforeIndex - 1; index >= 0; index--) {
    const item = pipe[index];
    if (item.kind === 'schema') {
      return item;
    }
  }
}
