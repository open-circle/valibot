import {
  type LooseObjectIssue,
  type LooseObjectSchemaAsync,
  nonOptionalAsync,
  type NonOptionalIssue,
  type NonOptionalSchemaAsync,
  type ObjectIssue,
  type ObjectSchemaAsync,
  type ObjectWithRestIssue,
  type ObjectWithRestSchemaAsync,
  type StrictObjectIssue,
  type StrictObjectSchemaAsync,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferObjectInput,
  InferObjectOutput,
  InferOutput,
  ObjectEntriesAsync,
  ObjectKeys,
  OutputDataset,
  SchemaWithoutPipe,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

export namespace requiredAsync {
  /**
   * Schema type.
   */
  export type Schema = SchemaWithoutPipe<
    | LooseObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | ObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<ObjectIssue> | undefined
      >
    | ObjectWithRestSchemaAsync<
        ObjectEntriesAsync,
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | StrictObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<StrictObjectIssue> | undefined
      >
  >;
}

/**
 * Required entries type.
 */
type RequiredEntries<
  TEntries extends ObjectEntriesAsync,
  TKeys extends readonly (keyof TEntries)[] | undefined,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = {
  [TKey in keyof TEntries]: TKeys extends readonly (keyof TEntries)[]
    ? TKey extends TKeys[number]
      ? NonOptionalSchemaAsync<TEntries[TKey], TMessage>
      : TEntries[TKey]
    : NonOptionalSchemaAsync<TEntries[TKey], TMessage>;
};

/**
 * Schema with required type.
 */
export type SchemaWithRequiredAsync<
  TSchema extends requiredAsync.Schema,
  TKeys extends ObjectKeys<TSchema> | undefined,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = TSchema extends
  | ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
  | StrictObjectSchemaAsync<
      infer TEntries,
      ErrorMessage<StrictObjectIssue> | undefined
    >
  ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
      /**
       * The object entries.
       */
      readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
      /**
       * The Standard Schema properties.
       *
       * @internal
       */
      readonly '~standard': StandardProps<
        InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>>,
        InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>
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
      ) => Promise<
        OutputDataset<
          InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>,
          NonOptionalIssue | InferIssue<TSchema>
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
              RequiredEntries<TEntries, TKeys, TMessage>
            >;
            readonly output: InferObjectOutput<
              RequiredEntries<TEntries, TKeys, TMessage>
            >;
            readonly issue: NonOptionalIssue | InferIssue<TSchema>;
          }
        | undefined;
    }
  : TSchema extends LooseObjectSchemaAsync<
        infer TEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
        /**
         * The object entries.
         */
        readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
        /**
         * The Standard Schema properties.
         *
         * @internal
         */
        readonly '~standard': StandardProps<
          InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
            [key: string]: unknown;
          },
          InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
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
        ) => Promise<
          OutputDataset<
            InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
              [key: string]: unknown;
            },
            NonOptionalIssue | InferIssue<TSchema>
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
                RequiredEntries<TEntries, TKeys, TMessage>
              > & {
                [key: string]: unknown;
              };
              readonly output: InferObjectOutput<
                RequiredEntries<TEntries, TKeys, TMessage>
              > & {
                [key: string]: unknown;
              };
              readonly issue: NonOptionalIssue | InferIssue<TSchema>;
            }
          | undefined;
      }
    : TSchema extends ObjectWithRestSchemaAsync<
          infer TEntries,
          infer TRest,
          ErrorMessage<ObjectWithRestIssue> | undefined
        >
      ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
          /**
           * The object entries.
           */
          readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
          /**
           * The Standard Schema properties.
           *
           * @internal
           */
          readonly '~standard': StandardProps<
            InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
              [key: string]: InferInput<TRest>;
            },
            InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
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
          ) => Promise<
            OutputDataset<
              InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
                [key: string]: InferOutput<TRest>;
              },
              NonOptionalIssue | InferIssue<TSchema>
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
                  RequiredEntries<TEntries, TKeys, TMessage>
                > & {
                  [key: string]: InferInput<TRest>;
                };
                readonly output: InferObjectOutput<
                  RequiredEntries<TEntries, TKeys, TMessage>
                > & { [key: string]: InferOutput<TRest> };
                readonly issue: NonOptionalIssue | InferIssue<TSchema>;
              }
            | undefined;
        }
      : never;

/**
 * Creates a modified copy of an object schema that marks all entries as required.
 *
 * @param schema The schema to modify.
 *
 * @returns An object schema.
 */
// @ts-expect-error FIXME: TypeScript incorrectly claims that the overload
// signature is not compatible with the implementation signature
export function requiredAsync<const TSchema extends Schema>(
  schema: TSchema
): SchemaWithRequiredAsync<TSchema, undefined, undefined>;

/**
 * Creates a modified copy of an object schema that marks all entries as required.
 *
 * @param schema The schema to modify.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function requiredAsync<
  const TSchema extends requiredAsync.Schema,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(
  schema: TSchema,
  message: TMessage
): SchemaWithRequiredAsync<TSchema, undefined, TMessage>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as required.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
export function requiredAsync<
  const TSchema extends requiredAsync.Schema,
  const TKeys extends ObjectKeys<TSchema>,
>(
  schema: TSchema,
  keys: TKeys
): SchemaWithRequiredAsync<TSchema, TKeys, undefined>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as required.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function requiredAsync<
  const TSchema extends requiredAsync.Schema,
  const TKeys extends ObjectKeys<TSchema>,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(
  schema: TSchema,
  keys: TKeys,
  message: TMessage
): SchemaWithRequiredAsync<TSchema, TKeys, TMessage>;

// @__NO_SIDE_EFFECTS__
export function requiredAsync(
  schema: requiredAsync.Schema,
  arg2?: ErrorMessage<NonOptionalIssue> | ObjectKeys<requiredAsync.Schema>,
  arg3?: ErrorMessage<NonOptionalIssue>
): SchemaWithRequiredAsync<
  requiredAsync.Schema,
  ObjectKeys<requiredAsync.Schema> | undefined,
  ErrorMessage<NonOptionalIssue> | undefined
> {
  // Get keys and message from arguments
  const keys = Array.isArray(arg2) ? arg2 : undefined;
  const message = (Array.isArray(arg2) ? arg3 : arg2) as
    | ErrorMessage<NonOptionalIssue>
    | undefined;

  // Create modified object entries
  const entries: RequiredEntries<
    ObjectEntriesAsync,
    ObjectKeys<requiredAsync.Schema>,
    ErrorMessage<NonOptionalIssue> | undefined
  > = {};
  for (const key in schema.entries) {
    // @ts-expect-error
    entries[key] =
      !keys || keys.includes(key)
        ? nonOptionalAsync(schema.entries[key], message)
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
