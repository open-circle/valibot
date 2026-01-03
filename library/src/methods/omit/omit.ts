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
  Config,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  InferOutput,
  ObjectEntries,
  ObjectEntriesAsync,
  ObjectKeys,
  OutputDataset,
  SchemaWithoutPipe,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

export namespace omit {
  /**
   * Schema type.
   */
  export type Schema = SchemaWithoutPipe<
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
      >
  >;
}

/**
 * Schema with omit type.
 */
export type SchemaWithOmit<
  TSchema extends omit.Schema,
  TKeys extends ObjectKeys<TSchema>,
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
      readonly entries: Omit<TEntries, TKeys[number]>;
      /**
       * The Standard Schema properties.
       *
       * @internal
       */
      readonly '~standard': StandardProps<
        InferObjectInput<Omit<TEntries, TKeys[number]>>,
        InferObjectOutput<Omit<TEntries, TKeys[number]>>
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
        InferObjectOutput<Omit<TEntries, TKeys[number]>>,
        | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
        | InferObjectIssue<Omit<TEntries, TKeys[number]>>
      >;
      /**
       * The input, output and issue type.
       *
       * @internal
       */
      readonly '~types'?:
        | {
            readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>>;
            readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>>;
            readonly issue:
              | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
              | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
          }
        | undefined;
    }
  : TSchema extends
        | ObjectSchemaAsync<
            infer TEntries,
            ErrorMessage<ObjectIssue> | undefined
          >
        | StrictObjectSchemaAsync<
            infer TEntries,
            ErrorMessage<StrictObjectIssue> | undefined
          >
    ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
        /**
         * The object entries.
         */
        readonly entries: Omit<TEntries, TKeys[number]>;
        /**
         * The Standard Schema properties.
         *
         * @internal
         */
        readonly '~standard': StandardProps<
          InferObjectInput<Omit<TEntries, TKeys[number]>>,
          InferObjectOutput<Omit<TEntries, TKeys[number]>>
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
            InferObjectOutput<Omit<TEntries, TKeys[number]>>,
            | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
            | InferObjectIssue<Omit<TEntries, TKeys[number]>>
          >
        >;
        /**
         * The input, output and issue type.
         *
         * @internal
         */
        readonly '~types'?:
          | {
              readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>>;
              readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>>;
              readonly issue:
                | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
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
          readonly entries: Omit<TEntries, TKeys[number]>;
          /**
           * The Standard Schema properties.
           *
           * @internal
           */
          readonly '~standard': StandardProps<
            InferObjectInput<Omit<TEntries, TKeys[number]>> & {
              [key: string]: unknown;
            },
            InferObjectInput<Omit<TEntries, TKeys[number]>> & {
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
            InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
              [key: string]: unknown;
            },
            | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
            | InferObjectIssue<Omit<TEntries, TKeys[number]>>
          >;
          /**
           * The input, output and issue type.
           *
           * @internal
           */
          readonly '~types'?:
            | {
                readonly input: InferObjectInput<
                  Omit<TEntries, TKeys[number]>
                > & {
                  [key: string]: unknown;
                };
                readonly output: InferObjectOutput<
                  Omit<TEntries, TKeys[number]>
                > & {
                  [key: string]: unknown;
                };
                readonly issue:
                  | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                  | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
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
            readonly entries: Omit<TEntries, TKeys[number]>;
            /**
             * The Standard Schema properties.
             *
             * @internal
             */
            readonly '~standard': StandardProps<
              InferObjectInput<Omit<TEntries, TKeys[number]>> & {
                [key: string]: unknown;
              },
              InferObjectInput<Omit<TEntries, TKeys[number]>> & {
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
                InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
                  [key: string]: unknown;
                },
                | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                | InferObjectIssue<Omit<TEntries, TKeys[number]>>
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
                    Omit<TEntries, TKeys[number]>
                  > & {
                    [key: string]: unknown;
                  };
                  readonly output: InferObjectOutput<
                    Omit<TEntries, TKeys[number]>
                  > & {
                    [key: string]: unknown;
                  };
                  readonly issue:
                    | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                    | InferObjectIssue<Omit<TEntries, TKeys[number]>>;
                }
              | undefined;
          }
        : TSchema extends ObjectWithRestSchema<
              infer TEntries,
              BaseSchema<unknown, unknown, BaseIssue<unknown>>,
              ErrorMessage<ObjectWithRestIssue> | undefined
            >
          ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
              /**
               * The object entries.
               */
              readonly entries: Omit<TEntries, TKeys[number]>;
              /**
               * The Standard Schema properties.
               *
               * @internal
               */
              readonly '~standard': StandardProps<
                InferObjectInput<Omit<TEntries, TKeys[number]>> & {
                  [key: string]: InferInput<TSchema['rest']>;
                },
                InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
                  [key: string]: InferOutput<TSchema['rest']>;
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
                InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
                  [key: string]: InferOutput<TSchema['rest']>;
                },
                | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                | InferObjectIssue<Omit<TEntries, TKeys[number]>>
                | InferIssue<TSchema['rest']>
              >;
              /**
               * The input, output and issue type.
               *
               * @internal
               */
              readonly '~types'?:
                | {
                    readonly input: InferObjectInput<
                      Omit<TEntries, TKeys[number]>
                    > & {
                      [key: string]: InferInput<TSchema['rest']>;
                    };
                    readonly output: InferObjectOutput<
                      Omit<TEntries, TKeys[number]>
                    > & { [key: string]: InferOutput<TSchema['rest']> };
                    readonly issue:
                      | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                      | InferObjectIssue<Omit<TEntries, TKeys[number]>>
                      | InferIssue<TSchema['rest']>;
                  }
                | undefined;
            }
          : TSchema extends ObjectWithRestSchemaAsync<
                infer TEntries,
                BaseSchema<unknown, unknown, BaseIssue<unknown>>,
                ErrorMessage<ObjectWithRestIssue> | undefined
              >
            ? Omit<TSchema, 'entries' | '~standard' | '~run' | '~types'> & {
                /**
                 * The object entries.
                 */
                readonly entries: Omit<TEntries, TKeys[number]>;
                /**
                 * The Standard Schema properties.
                 *
                 * @internal
                 */
                readonly '~standard': StandardProps<
                  InferObjectInput<Omit<TEntries, TKeys[number]>> & {
                    [key: string]: InferInput<TSchema['rest']>;
                  },
                  InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
                    [key: string]: InferOutput<TSchema['rest']>;
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
                    InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
                      [key: string]: InferOutput<TSchema['rest']>;
                    },
                    | Extract<InferIssue<TSchema>, { type: TSchema['type'] }>
                    | InferObjectIssue<Omit<TEntries, TKeys[number]>>
                    | InferIssue<TSchema['rest']>
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
                        Omit<TEntries, TKeys[number]>
                      > & {
                        [key: string]: InferInput<TSchema['rest']>;
                      };
                      readonly output: InferObjectOutput<
                        Omit<TEntries, TKeys[number]>
                      > & { [key: string]: InferOutput<TSchema['rest']> };
                      readonly issue:
                        | Extract<
                            InferIssue<TSchema>,
                            { type: TSchema['type'] }
                          >
                        | InferObjectIssue<Omit<TEntries, TKeys[number]>>
                        | InferIssue<TSchema['rest']>;
                    }
                  | undefined;
              }
            : never;

/**
 * Creates a modified copy of an object schema that does not contain the
 * selected entries.
 *
 * @param schema The schema to omit from.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
// @__NO_SIDE_EFFECTS__
export function omit<
  const TSchema extends omit.Schema,
  const TKeys extends ObjectKeys<TSchema>,
>(schema: TSchema, keys: TKeys): SchemaWithOmit<TSchema, TKeys> {
  // Create modified object entries
  // @ts-expect-error
  const entries: Omit<TSchema['entries'], TKeys[number]> = {
    ...schema.entries,
  };
  for (const key of keys) {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete entries[key];
  }

  // Rerturn modified copy of schema
  // @ts-expect-error
  return {
    ...schema,
    entries,
    get '~standard'() {
      return _getStandardProps(this);
    },
  };
}
