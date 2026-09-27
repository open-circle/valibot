import {
  nonOptionalAsync,
  type NonOptionalIssue,
  type NonOptionalSchemaAsync,
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
  (
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
  ) &
    (
      | {
          readonly type: 'object' | 'strict_object';
          readonly entries: ObjectEntriesAsync;
        }
      | {
          readonly type: 'loose_object';
          readonly entries: ObjectEntriesAsync;
        }
      | {
          readonly type: 'object_with_rest';
          readonly entries: ObjectEntriesAsync;
          readonly rest:
            | BaseSchema<unknown, unknown, BaseIssue<unknown>>
            | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;
        }
    )
>;

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
 *
 * Hint: We match the object schemas structurally instead of inferring from
 * their interfaces, because relating an object schema to another
 * instantiation of the same interface forces TypeScript to measure its
 * variance, which is expensive (see issue #1663).
 */
export type SchemaWithRequiredAsync<
  TSchema extends Schema,
  TKeys extends ObjectKeys<TSchema> | undefined,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = TSchema extends {
  readonly type: 'object' | 'strict_object';
  readonly async: true;
  readonly entries: infer TEntries extends ObjectEntriesAsync;
}
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
  : TSchema extends {
        readonly type: 'loose_object';
        readonly async: true;
        readonly entries: infer TEntries extends ObjectEntriesAsync;
      }
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
    : TSchema extends {
          readonly type: 'object_with_rest';
          readonly async: true;
          readonly entries: infer TEntries extends ObjectEntriesAsync;
          readonly rest: infer TRest extends
            | BaseSchema<unknown, unknown, BaseIssue<unknown>>
            | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;
        }
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
  const TSchema extends Schema,
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
  const TSchema extends Schema,
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
  const TSchema extends Schema,
  const TKeys extends ObjectKeys<TSchema>,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(
  schema: TSchema,
  keys: TKeys,
  message: TMessage
): SchemaWithRequiredAsync<TSchema, TKeys, TMessage>;

// @__NO_SIDE_EFFECTS__
export function requiredAsync(
  schema: Schema,
  arg2?: ErrorMessage<NonOptionalIssue> | ObjectKeys<Schema>,
  arg3?: ErrorMessage<NonOptionalIssue>
): SchemaWithRequiredAsync<
  Schema,
  ObjectKeys<Schema> | undefined,
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
    ObjectKeys<Schema>,
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
  // @ts-expect-error
  return _standardSchema({
    ...schema,
    entries,
  });
}
