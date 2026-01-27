import {
  type LooseObjectIssue,
  type LooseObjectSchema,
  type ObjectIssue,
  type ObjectSchema,
  type ObjectWithRestIssue,
  type ObjectWithRestSchema,
  optional,
  type OptionalSchema,
  type StrictObjectIssue,
  type StrictObjectSchema,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Config,
  ErrorMessage,
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
import { _getStandardProps } from '../../utils/index.ts';

export namespace partial {
  /**
   * Schema type.
   */
  export type Schema = SchemaWithoutPipe<
    | LooseObjectSchema<
        ObjectEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
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
}

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
 */
export type SchemaWithPartial<
  TSchema extends partial.Schema,
  TKeys extends ObjectKeys<TSchema> | undefined,
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
  : TSchema extends LooseObjectSchema<
        infer TEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
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
    : TSchema extends ObjectWithRestSchema<
          infer TEntries,
          infer TRest,
          ErrorMessage<ObjectWithRestIssue> | undefined
        >
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
export function partial<const TSchema extends partial.Schema>(
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
  const TSchema extends partial.Schema,
  const TKeys extends ObjectKeys<TSchema>,
>(schema: TSchema, keys: TKeys): SchemaWithPartial<TSchema, TKeys>;

// @__NO_SIDE_EFFECTS__
export function partial(
  schema: partial.Schema,
  keys?: ObjectKeys<partial.Schema>
): SchemaWithPartial<partial.Schema, ObjectKeys<partial.Schema> | undefined> {
  // Create modified object entries
  const entries: PartialEntries<ObjectEntries, ObjectKeys<partial.Schema>> = {};
  for (const key in schema.entries) {
    // @ts-expect-error
    entries[key] =
      !keys || keys.includes(key)
        ? optional(schema.entries[key])
        : schema.entries[key];
  }

  // Return modified copy of schema
  return {
    ...schema,
    entries,
    get '~standard'() {
      return _getStandardProps(this);
    },
  };
}
