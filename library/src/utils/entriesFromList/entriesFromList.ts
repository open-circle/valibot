import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
} from '../../types/index.ts';

/**
 * Creates an object entries definition from a list of keys and a schema.
 *
 * @param list A list of keys.
 * @param schema The schema of the keys.
 *
 * @returns The object entries.
 */
// @__NO_SIDE_EFFECTS__
export function entriesFromList<
  const TList extends readonly (string | number | symbol)[],
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(list: TList, schema: TSchema): Record<TList[number], TSchema> {
  // @ts-expect-error
  const entries: Record<TList[number], TSchema> = {};
  for (const key of list) {
    Object.defineProperty(entries, key, {
      value: schema,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  return entries;
}
