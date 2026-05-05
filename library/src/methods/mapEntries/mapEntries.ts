import {
  type LooseObjectIssue,
  type LooseObjectSchema,
  nullish,
  number,
  object,
  type ObjectIssue,
  type ObjectSchema,
  type ObjectWithRestIssue,
  type ObjectWithRestSchema,
  optional,
  type StrictObjectIssue,
  type StrictObjectSchema,
  string,
} from '../../schemas/index.ts';
import type {
  ApplyHKT,
  BaseHKT,
  BaseHKTable,
  BaseIssue,
  BaseSchema,
  Config,
  ErrorMessage,
  HKTImplementation,
  InferHKT,
  InferInput,
  InferIssue,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  InferOutput,
  ObjectEntries,
  OutputDataset,
  Prettify,
  SchemaWithoutPipe,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

/**
 * Schema type.
 */
type Schema = SchemaWithoutPipe<
  | LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>
  | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
  | ObjectWithRestSchema<
      ObjectEntries,
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<ObjectWithRestIssue> | undefined
    >
  | StrictObjectSchema<
      ObjectEntries,
      ErrorMessage<StrictObjectIssue> | undefined
    >
>;

export interface SchemaMapperHKT extends BaseHKT {
  argConstraint: [wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>];
  result: BaseSchema<unknown, unknown, BaseIssue<unknown>>;

  wrapped: this['args'][0];
}

export interface IdentitySchemaMapperHKT extends SchemaMapperHKT {
  result: this['wrapped'];
}

export type EntryMapOverrides<TEntries extends ObjectEntries> = {
  [TKey in keyof TEntries]?: (
    schema: TEntries[TKey]
  ) => SchemaMapperHKT['result'];
};

export type MappedEntries<
  TEntries extends ObjectEntries,
  TDefaultMapper extends SchemaMapperHKT = IdentitySchemaMapperHKT,
  TOverrides extends EntryMapOverrides<TEntries> = Record<never, never>,
> = Prettify<{
  [TKey in keyof TEntries]: TOverrides[TKey] extends HKTImplementation<SchemaMapperHKT>
    ? Extract<
        ApplyHKT<
          InferHKT<Extract<ReturnType<TOverrides[TKey]>, BaseHKTable>>,
          [TEntries[TKey]]
        >,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>
      >
    : TOverrides[TKey] extends ((
          schema: TEntries[TKey]
        ) => infer Result extends SchemaMapperHKT['result'])
      ? Result
      : ApplyHKT<TDefaultMapper, [TEntries[TKey]]>;
}>;

/**
 * Schema with modified entries type.
 */
export type SchemaWithMappedEntries<
  TSchema extends Schema,
  TDefaultMapper extends SchemaMapperHKT = IdentitySchemaMapperHKT,
  TOverrides extends EntryMapOverrides<Schema['entries']> = Record<
    never,
    never
  >,
> = TSchema extends
  | ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
  | StrictObjectSchema<
      infer TEntries,
      ErrorMessage<StrictObjectIssue> | undefined
    >
  ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
      /**
       * The object entries.
       */
      readonly entries: MappedEntries<TEntries, TDefaultMapper, TOverrides>;
      /**
       * The Standard Schema properties.
       *
       * @internal
       */
      readonly '~standard': StandardProps<
        InferObjectInput<MappedEntries<TEntries, TDefaultMapper, TOverrides>>,
        InferObjectOutput<MappedEntries<TEntries, TDefaultMapper, TOverrides>>
      >;
      /**
       * Parses unknown input.
       *
       * @param dataset The input dataset.
       * @param config The configuration.
       *
       * @returns The output dataset.
       *
       * @internal
       */
      readonly '~run': (
        dataset: UnknownDataset,
        config: Config<BaseIssue<unknown>>
      ) => OutputDataset<
        InferObjectOutput<MappedEntries<TEntries, TDefaultMapper, TOverrides>>,
        InferIssue<TSchema>
      >;
      /**
       * The input, output and issue type.
       *
       * @internal
       */
      readonly '~types'?:
        | {
            readonly input: InferObjectInput<
              MappedEntries<TEntries, TDefaultMapper, TOverrides>
            >;
            readonly output: InferObjectOutput<
              MappedEntries<TEntries, TDefaultMapper, TOverrides>
            >;
            readonly issue:
              | InferIssue<TSchema>
              | InferObjectIssue<
                  MappedEntries<TEntries, TDefaultMapper, TOverrides>
                >;
          }
        | undefined;
    }
  : TSchema extends LooseObjectSchema<
        infer TEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
        /**
         * The object entries.
         */
        readonly entries: MappedEntries<TEntries, TDefaultMapper, TOverrides>;
        /**
         * The Standard Schema properties.
         *
         * @internal
         */
        readonly '~standard': StandardProps<
          InferObjectInput<
            MappedEntries<TEntries, TDefaultMapper, TOverrides>
          > & {
            [key: string]: unknown;
          },
          InferObjectOutput<
            MappedEntries<TEntries, TDefaultMapper, TOverrides>
          > & {
            [key: string]: unknown;
          }
        >;
        /**
         * Parses unknown input.
         *
         * @param dataset The input dataset.
         * @param config The configuration.
         *
         * @returns The output dataset.
         *
         * @internal
         */
        readonly '~run': (
          dataset: UnknownDataset,
          config: Config<BaseIssue<unknown>>
        ) => OutputDataset<
          InferObjectOutput<
            MappedEntries<TEntries, TDefaultMapper, TOverrides>
          > & {
            [key: string]: unknown;
          },
          InferIssue<TSchema>
        >;
        /**
         * The input, output and issue type.
         *
         * @internal
         */
        readonly '~types'?:
          | {
              readonly input: InferObjectInput<
                MappedEntries<TEntries, TDefaultMapper, TOverrides>
              > & {
                [key: string]: unknown;
              };
              readonly output: InferObjectOutput<
                MappedEntries<TEntries, TDefaultMapper, TOverrides>
              > & {
                [key: string]: unknown;
              };
              readonly issue:
                | InferIssue<TSchema>
                | InferObjectIssue<
                    MappedEntries<TEntries, TDefaultMapper, TOverrides>
                  >;
            }
          | undefined;
      }
    : TSchema extends ObjectWithRestSchema<
          infer TEntries,
          infer TRest,
          ErrorMessage<ObjectWithRestIssue> | undefined
        >
      ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
          /**
           * The object entries.
           */
          readonly entries: MappedEntries<TEntries, TDefaultMapper, TOverrides>;
          /**
           * The Standard Schema properties.
           *
           * @internal
           */
          readonly '~standard': StandardProps<
            InferObjectInput<
              MappedEntries<TEntries, TDefaultMapper, TOverrides>
            > & {
              [key: string]: InferInput<TRest>;
            },
            InferObjectOutput<
              MappedEntries<TEntries, TDefaultMapper, TOverrides>
            > & {
              [key: string]: InferOutput<TRest>;
            }
          >;
          /**
           * Parses unknown input.
           *
           * @param dataset The input dataset.
           * @param config The configuration.
           *
           * @returns The output dataset.
           *
           * @internal
           */
          readonly '~run': (
            dataset: UnknownDataset,
            config: Config<BaseIssue<unknown>>
          ) => OutputDataset<
            InferObjectOutput<
              MappedEntries<TEntries, TDefaultMapper, TOverrides>
            > & {
              [key: string]: InferOutput<TRest>;
            },
            | InferIssue<TSchema>
            | InferObjectIssue<
                MappedEntries<TEntries, TDefaultMapper, TOverrides>
              >
          >;
          /**
           * The input, output and issue type.
           *
           * @internal
           */
          readonly '~types'?:
            | {
                readonly input: InferObjectInput<
                  MappedEntries<TEntries, TDefaultMapper, TOverrides>
                > & {
                  [key: string]: InferInput<TRest>;
                };
                readonly output: InferObjectOutput<
                  MappedEntries<TEntries, TDefaultMapper, TOverrides>
                > & { [key: string]: InferOutput<TRest> };
                readonly issue:
                  | InferIssue<TSchema>
                  | InferObjectIssue<
                      MappedEntries<TEntries, TDefaultMapper, TOverrides>
                    >;
              }
            | undefined;
        }
      : never;

/**
 * Maps the entries of an object schema.
 *
 * @param schema The schema to map.
 * @param mapper The default mapper, e.g. `optional` or `nullable`.
 *
 * @returns The schema with mapped entries.
 */
export function mapEntries<
  TSchema extends Schema,
  TMapper extends SchemaMapperHKT,
>(
  schema: TSchema,
  mapper: HKTImplementation<TMapper>
): SchemaWithMappedEntries<TSchema, TMapper>;

/**
 * Maps the entries of an object schema.
 *
 * @param schema The schema to map.
 * @param map A map of modifiers for specific entries.
 *
 * @returns The schema with mapped entries.
 */
export function mapEntries<
  TSchema extends Schema,
  TOverrides extends EntryMapOverrides<TSchema['entries']>,
>(
  schema: TSchema,
  map: TOverrides
): SchemaWithMappedEntries<TSchema, IdentitySchemaMapperHKT, TOverrides>;

/**
 * Maps the entries of an object schema.
 *
 * @param schema The schema to map.
 * @param mapper The default mapper, e.g. `optional` or `nullable`.
 * @param overrides Overrides for specific entries.
 *
 * @returns The schema with mapped entries.
 */
export function mapEntries<
  TSchema extends Schema,
  TDefaultMapper extends SchemaMapperHKT,
  TOverrides extends EntryMapOverrides<TSchema['entries']>,
>(
  schema: TSchema,
  mapper: HKTImplementation<TDefaultMapper>,
  overrides: TOverrides
): SchemaWithMappedEntries<TSchema, TDefaultMapper, TOverrides>;

// @__NO_SIDE_EFFECTS__
export function mapEntries(
  schema: Schema,
  mapperOrMap:
    | HKTImplementation<SchemaMapperHKT>
    | EntryMapOverrides<Schema['entries']>,
  overrides_?: EntryMapOverrides<Schema['entries']>
): SchemaWithMappedEntries<
  Schema,
  SchemaMapperHKT,
  EntryMapOverrides<Schema['entries']>
> {
  const [mapper, overrides = {}]: [
    (schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>) => typeof schema,
    EntryMapOverrides<Schema['entries']> | undefined,
  ] =
    typeof mapperOrMap === 'function'
      ? [mapperOrMap, overrides_]
      : [(s) => s, mapperOrMap];

  // Create modified object entries
  const entries: MappedEntries<
    Schema['entries'],
    SchemaMapperHKT,
    EntryMapOverrides<Schema['entries']>
  > = {};
  for (const key in schema.entries) {
    entries[key] = overrides[key]
      ? overrides[key](schema.entries[key])
      : mapper(schema.entries[key]);
  }
  return {
    ...schema,
    entries,
    get '~standard'() {
      return _getStandardProps(this);
    },
  };
}

const schema = object({ name: string(), age: number(), email: string() });

const test = mapEntries(schema, optional, {
  name: (schema) => nullish(schema, 'foo'),
  email: nullish,
});

/*
// make all optional
v.mapEntries(Schema, v.optional)
// manually specify each
v.mapEntries(Schema, {
  name: v.nullable,
  age: v.optional,
  email: (schema) => v.nullish(schema, 'default_value'),
})
// which would also allow the below (if we modified v.entriesFromList a little)
v.mapEntries(Schema, v.entriesFromList(["name", "age"], v.optional))
// maybe even allow
v.mapEntries(Schema, v.optional, { name: v.nullable }) // blanket with overrides
// maybe? seems like footgun
v.mapEntries(Schema, (schema) => v.optional(schema, 'default_value'))
*/
