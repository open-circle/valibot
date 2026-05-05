import type { ConversionContext } from '../types/index.ts';

/**
 * Creates a new conversion context.
 *
 * @param initial The initial context to use.
 *
 * @returns A new conversion context.
 */
export function createContext(
  initial?: Omit<ConversionContext, 'getterMap'>
): ConversionContext {
  return {
    definitions: initial?.definitions ?? {},
    referenceMap: initial?.referenceMap ?? new Map(),
    getterMap: new Map(),
  };
}
