import type {
  LooseObjectIssue,
  LooseObjectSchema,
  LooseObjectSchemaAsync,
  ObjectIssue,
  ObjectSchema,
  ObjectSchemaAsync,
  ObjectWithRestIssue,
  ObjectWithRestSchema,
  ObjectWithRestSchemaAsync,
  StrictObjectIssue,
  StrictObjectSchema,
  StrictObjectSchemaAsync,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  Merge,
  ObjectEntries,
  ObjectEntriesAsync,
  Prettify,
} from '../../types/index.ts';

export namespace entriesFromObjects {
  /**
   * Schema type.
   */
  export type Schema =
    | LooseObjectSchema<
        ObjectEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | LooseObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
    | ObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<ObjectIssue> | undefined
      >
    | ObjectWithRestSchema<
        ObjectEntries,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | ObjectWithRestSchemaAsync<
        ObjectEntriesAsync,
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | StrictObjectSchema<
        ObjectEntries,
        ErrorMessage<StrictObjectIssue> | undefined
      >
    | StrictObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<StrictObjectIssue> | undefined
      >;
}

/**
 * Recursive merge type.
 */
type RecursiveMerge<
  TSchemas extends readonly [
    entriesFromObjects.Schema,
    ...entriesFromObjects.Schema[],
  ],
> = TSchemas extends readonly [
  infer TFirstSchema extends entriesFromObjects.Schema,
]
  ? TFirstSchema['entries']
  : TSchemas extends readonly [
        infer TFirstSchema extends entriesFromObjects.Schema,
        ...infer TRestSchemas extends readonly [
          entriesFromObjects.Schema,
          ...entriesFromObjects.Schema[],
        ],
      ]
    ? Merge<TFirstSchema['entries'], RecursiveMerge<TRestSchemas>>
    : never;

/**
 * Merged entries types.
 */
type MergedEntries<
  TSchemas extends readonly [
    entriesFromObjects.Schema,
    ...entriesFromObjects.Schema[],
  ],
> = Prettify<RecursiveMerge<TSchemas>>;

/**
 * Creates a new object entries definition from existing object schemas.
 *
 * @param schemas The schemas to merge the entries from.
 *
 * @returns The object entries from the schemas.
 */
export function entriesFromObjects<
  const TSchemas extends readonly [
    entriesFromObjects.Schema,
    ...entriesFromObjects.Schema[],
  ],
>(schemas: TSchemas): MergedEntries<TSchemas>;

// @__NO_SIDE_EFFECTS__
export function entriesFromObjects(
  schemas: [entriesFromObjects.Schema, ...entriesFromObjects.Schema[]]
): MergedEntries<[entriesFromObjects.Schema, ...entriesFromObjects.Schema[]]> {
  const entries = {};
  for (const schema of schemas) {
    Object.assign(entries, schema.entries);
  }
  // @ts-expect-error
  return entries;
}
