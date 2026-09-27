import { optional, type OptionalSchema } from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferInput,
  InferIssue,
  InferObjectInput,
  InferObjectOutput,
  InferOutput,
  ObjectEntries,
  ObjectKeys,
  OutputDataset,
  SchemaWithoutPipe,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';

/**
 * Schema type.
 *
 * Hint: We describe the object schemas structurally instead of using their
 * interfaces, because relating an object schema to another instantiation of
 * the same interface forces TypeScript to measure its variance, which is
 * expensive (see issue #1663).
 */
type Schema = SchemaWithoutPipe<
  BaseSchema<unknown, unknown, BaseIssue<unknown>> &
    (
      | {
          readonly type: 'object' | 'strict_object';
          readonly entries: ObjectEntries;
        }
      | {
          readonly type: 'loose_object';
          readonly entries: ObjectEntries;
        }
      | {
          readonly type: 'object_with_rest';
          readonly entries: ObjectEntries;
          readonly rest: BaseSchema<unknown, unknown, BaseIssue<unknown>>;
        }
    )
>;

/**
 * Partial entries type.
 */
type PartialEntries<
  TEntries extends ObjectEntries,
  TKeys extends readonly (keyof TEntries)[] | undefined,
> = {
  [TKey in keyof TEntries]: TKeys extends readonly (keyof TEntries)[]
    ? TKey extends TKeys[number]
      ? OptionalSchema<TEntries[TKey], undefined>
      : TEntries[TKey]
    : OptionalSchema<TEntries[TKey], undefined>;
};

/**
 * Schema with partial type.
 *
 * Hint: We match the object schemas structurally instead of inferring from
 * their interfaces, because relating an object schema to another
 * instantiation of the same interface forces TypeScript to measure its
 * variance, which is expensive (see issue #1663).
 */
export type SchemaWithPartial<
  TSchema extends Schema,
  TKeys extends ObjectKeys<TSchema> | undefined,
> = TSchema extends {
  readonly type: 'object' | 'strict_object';
  readonly async: false;
  readonly entries: infer TEntries extends ObjectEntries;
}
  ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
      /**
       * The object entries.
       */
      readonly entries: PartialEntries<TEntries, TKeys>;
      /**
       * The Standard Schema properties.
       *
       * @internal
       */
      readonly '~standard': StandardProps<
        InferObjectInput<PartialEntries<TEntries, TKeys>>,
        InferObjectOutput<PartialEntries<TEntries, TKeys>>
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
        InferObjectOutput<PartialEntries<TEntries, TKeys>>,
        InferIssue<TSchema>
      >;
      /**
       * The input, output and issue type.
       *
       * @internal
       */
      readonly '~types'?:
        | {
            readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>>;
            readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>>;
            readonly issue: InferIssue<TSchema>;
          }
        | undefined;
    }
  : TSchema extends {
        readonly type: 'loose_object';
        readonly async: false;
        readonly entries: infer TEntries extends ObjectEntries;
      }
    ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
        /**
         * The object entries.
         */
        readonly entries: PartialEntries<TEntries, TKeys>;
        /**
         * The Standard Schema properties.
         *
         * @internal
         */
        readonly '~standard': StandardProps<
          InferObjectInput<PartialEntries<TEntries, TKeys>> & {
            [key: string]: unknown;
          },
          InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
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
          InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
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
                PartialEntries<TEntries, TKeys>
              > & {
                [key: string]: unknown;
              };
              readonly output: InferObjectOutput<
                PartialEntries<TEntries, TKeys>
              > & {
                [key: string]: unknown;
              };
              readonly issue: InferIssue<TSchema>;
            }
          | undefined;
      }
    : TSchema extends {
          readonly type: 'object_with_rest';
          readonly async: false;
          readonly entries: infer TEntries extends ObjectEntries;
          readonly rest: infer TRest extends BaseSchema<
            unknown,
            unknown,
            BaseIssue<unknown>
          >;
        }
      ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
          /**
           * The object entries.
           */
          readonly entries: PartialEntries<TEntries, TKeys>;
          /**
           * The Standard Schema properties.
           *
           * @internal
           */
          readonly '~standard': StandardProps<
            InferObjectInput<PartialEntries<TEntries, TKeys>> & {
              [key: string]: InferInput<TRest>;
            },
            InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
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
            InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
              [key: string]: InferOutput<TRest>;
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
                  PartialEntries<TEntries, TKeys>
                > & {
                  [key: string]: InferInput<TRest>;
                };
                readonly output: InferObjectOutput<
                  PartialEntries<TEntries, TKeys>
                > & { [key: string]: InferOutput<TRest> };
                readonly issue: InferIssue<TSchema>;
              }
            | undefined;
        }
      : never;

/**
 * Creates a modified copy of an object schema that marks all entries as optional.
 *
 * @param schema The schema to modify.
 *
 * @returns An object schema.
 */
export function partial<const TSchema extends Schema>(
  schema: TSchema
): SchemaWithPartial<TSchema, undefined>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as optional.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
export function partial<
  const TSchema extends Schema,
  const TKeys extends ObjectKeys<TSchema>,
>(schema: TSchema, keys: TKeys): SchemaWithPartial<TSchema, TKeys>;

// @__NO_SIDE_EFFECTS__
export function partial(
  schema: Schema,
  keys?: ObjectKeys<Schema>
): SchemaWithPartial<Schema, ObjectKeys<Schema> | undefined> {
  // Create modified object entries
  const entries: PartialEntries<ObjectEntries, ObjectKeys<Schema>> = {};
  for (const key in schema.entries) {
    // @ts-expect-error
    entries[key] =
      !keys || keys.includes(key)
        ? optional(schema.entries[key])
        : schema.entries[key];
  }

  // Return modified copy of schema
  // @ts-expect-error
  return _standardSchema({
    ...schema,
    entries,
  });
}
