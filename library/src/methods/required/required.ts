import {
  type LooseObjectIssue,
  type LooseObjectSchema,
  nonOptional,
  type NonOptionalIssue,
  type NonOptionalSchema,
  type ObjectIssue,
  type ObjectSchema,
  type ObjectWithRestIssue,
  type ObjectWithRestSchema,
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
import { _standardSchema } from '../../utils/index.ts';

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

/**
 * Required entries type.
 */
type RequiredEntries<
  TEntries extends ObjectEntries,
  TKeys extends readonly (keyof TEntries)[] | undefined,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = {
  [TKey in keyof TEntries]: TKeys extends readonly (keyof TEntries)[]
    ? TKey extends TKeys[number]
      ? NonOptionalSchema<TEntries[TKey], TMessage>
      : TEntries[TKey]
    : NonOptionalSchema<TEntries[TKey], TMessage>;
};

/**
 * Schema with required type.
 *
 * Hint: We match the object schemas structurally instead of inferring from
 * their interfaces, because relating an object schema to another
 * instantiation of the same interface forces TypeScript to measure its
 * variance, which is expensive (see issue #1663).
 */
export type SchemaWithRequired<
  TSchema extends Schema,
  TKeys extends ObjectKeys<TSchema> | undefined,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = TSchema extends {
  readonly type: 'object' | 'strict_object';
  readonly async: false;
  readonly entries: infer TEntries extends ObjectEntries;
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
      ) => OutputDataset<
        InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>,
        NonOptionalIssue | InferIssue<TSchema>
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
        readonly async: false;
        readonly entries: infer TEntries extends ObjectEntries;
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
        ) => OutputDataset<
          InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
            [key: string]: unknown;
          },
          NonOptionalIssue | InferIssue<TSchema>
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
          ) => OutputDataset<
            InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
              [key: string]: InferOutput<TRest>;
            },
            NonOptionalIssue | InferIssue<TSchema>
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
export function required<const TSchema extends Schema>(
  schema: TSchema
): SchemaWithRequired<TSchema, undefined, undefined>;

/**
 * Creates a modified copy of an object schema that marks all entries as required.
 *
 * @param schema The schema to modify.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function required<
  const TSchema extends Schema,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(
  schema: TSchema,
  message: TMessage
): SchemaWithRequired<TSchema, undefined, TMessage>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as required.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
export function required<
  const TSchema extends Schema,
  const TKeys extends ObjectKeys<TSchema>,
>(schema: TSchema, keys: TKeys): SchemaWithRequired<TSchema, TKeys, undefined>;

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
export function required<
  const TSchema extends Schema,
  const TKeys extends ObjectKeys<TSchema>,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(
  schema: TSchema,
  keys: TKeys,
  message: TMessage
): SchemaWithRequired<TSchema, TKeys, TMessage>;

// @__NO_SIDE_EFFECTS__
export function required(
  schema: Schema,
  arg2?: ErrorMessage<NonOptionalIssue> | ObjectKeys<Schema>,
  arg3?: ErrorMessage<NonOptionalIssue>
): SchemaWithRequired<
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
    ObjectEntries,
    ObjectKeys<Schema>,
    ErrorMessage<NonOptionalIssue> | undefined
  > = {};
  for (const key in schema.entries) {
    // @ts-expect-error
    entries[key] =
      !keys || keys.includes(key)
        ? nonOptional(schema.entries[key], message)
        : schema.entries[key];
  }

  // Return modified copy of schema
  return _standardSchema({
    ...schema,
    entries,
  });
}
