import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  FirstTupleItem,
  InferInput,
  InferIssue,
  InferOutput,
  LastTupleItem,
  OutputDataset,
  PipeAction,
  PipeActionAsync,
  PipeItem,
  PipeItemAsync,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

/**
 * Schema with pipe async type.
 */
export type SchemaWithPipeAsync<
  TPipe extends readonly [
    (
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    ),
    ...(
      | PipeItem<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
      | PipeItemAsync<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
    )[],
  ],
> = Omit<
  FirstTupleItem<TPipe>,
  'async' | 'pipe' | '~standard' | '~run' | '~types'
> & {
  /**
   * The pipe items.
   */
  readonly pipe: TPipe;
  /**
   * Whether it's async.
   */
  readonly async: true;
  /**
   * The Standard Schema properties.
   *
   * @internal
   */
  readonly '~standard': StandardProps<
    InferInput<FirstTupleItem<TPipe>>,
    InferOutput<LastTupleItem<TPipe>>
  >;
  /**
   * Parses unknown input values.
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
    OutputDataset<InferOutput<LastTupleItem<TPipe>>, InferIssue<TPipe[number]>>
  >;
  /**
   * The input, output and issue type.
   *
   * @internal
   */
  readonly '~types'?:
    | {
        readonly input: InferInput<FirstTupleItem<TPipe>>;
        readonly output: InferOutput<LastTupleItem<TPipe>>;
        readonly issue: InferIssue<TPipe[number]>;
      }
    | undefined;
};

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >
): SchemaWithPipeAsync<readonly [TSchema, TItem1]>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >
): SchemaWithPipeAsync<readonly [TSchema, TItem1, TItem2]>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >
): SchemaWithPipeAsync<readonly [TSchema, TItem1, TItem2, TItem3]>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >
): SchemaWithPipeAsync<readonly [TSchema, TItem1, TItem2, TItem3, TItem4]>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >
): SchemaWithPipeAsync<
  readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >
): SchemaWithPipeAsync<
  readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >
): SchemaWithPipeAsync<
  readonly [TSchema, TItem1, TItem2, TItem3, TItem4, TItem5, TItem6, TItem7]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 * @param item14 The fourteenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
  const TItem14 extends
    | PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >,
  item14:
    | TItem14
    | PipeAction<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
    | PipeActionAsync<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
    TItem14,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 * @param item14 The fourteenth pipe item.
 * @param item15 The fifteenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
  const TItem14 extends
    | PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>,
  const TItem15 extends
    | PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >,
  item14:
    | TItem14
    | PipeAction<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
    | PipeActionAsync<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >,
  item15:
    | TItem15
    | PipeAction<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >
    | PipeActionAsync<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
    TItem14,
    TItem15,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 * @param item14 The fourteenth pipe item.
 * @param item15 The fifteenth pipe item.
 * @param item16 The sixteenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
  const TItem14 extends
    | PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>,
  const TItem15 extends
    | PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>,
  const TItem16 extends
    | PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >,
  item14:
    | TItem14
    | PipeAction<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
    | PipeActionAsync<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >,
  item15:
    | TItem15
    | PipeAction<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >
    | PipeActionAsync<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >,
  item16:
    | TItem16
    | PipeAction<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >
    | PipeActionAsync<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
    TItem14,
    TItem15,
    TItem16,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 * @param item14 The fourteenth pipe item.
 * @param item15 The fifteenth pipe item.
 * @param item16 The sixteenth pipe item.
 * @param item17 The seventeenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
  const TItem14 extends
    | PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>,
  const TItem15 extends
    | PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>,
  const TItem16 extends
    | PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>,
  const TItem17 extends
    | PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem16>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >,
  item14:
    | TItem14
    | PipeAction<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
    | PipeActionAsync<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >,
  item15:
    | TItem15
    | PipeAction<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >
    | PipeActionAsync<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >,
  item16:
    | TItem16
    | PipeAction<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >
    | PipeActionAsync<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >,
  item17:
    | TItem17
    | PipeAction<
        InferOutput<TItem16>,
        InferOutput<TItem17>,
        InferIssue<TItem17>
      >
    | PipeActionAsync<
        InferOutput<TItem16>,
        InferOutput<TItem17>,
        InferIssue<TItem17>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
    TItem14,
    TItem15,
    TItem16,
    TItem17,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 * @param item14 The fourteenth pipe item.
 * @param item15 The fifteenth pipe item.
 * @param item16 The sixteenth pipe item.
 * @param item17 The seventeenth pipe item.
 * @param item18 The eighteenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
  const TItem14 extends
    | PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>,
  const TItem15 extends
    | PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>,
  const TItem16 extends
    | PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>,
  const TItem17 extends
    | PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem16>, unknown, BaseIssue<unknown>>,
  const TItem18 extends
    | PipeItem<InferOutput<TItem17>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem17>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >,
  item14:
    | TItem14
    | PipeAction<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
    | PipeActionAsync<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >,
  item15:
    | TItem15
    | PipeAction<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >
    | PipeActionAsync<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >,
  item16:
    | TItem16
    | PipeAction<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >
    | PipeActionAsync<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >,
  item17:
    | TItem17
    | PipeAction<
        InferOutput<TItem16>,
        InferOutput<TItem17>,
        InferIssue<TItem17>
      >
    | PipeActionAsync<
        InferOutput<TItem16>,
        InferOutput<TItem17>,
        InferIssue<TItem17>
      >,
  item18:
    | TItem18
    | PipeAction<
        InferOutput<TItem17>,
        InferOutput<TItem18>,
        InferIssue<TItem18>
      >
    | PipeActionAsync<
        InferOutput<TItem17>,
        InferOutput<TItem18>,
        InferIssue<TItem18>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
    TItem14,
    TItem15,
    TItem16,
    TItem17,
    TItem18,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param item1 The first pipe item.
 * @param item2 The second pipe item.
 * @param item3 The third pipe item.
 * @param item4 The fourth pipe item.
 * @param item5 The fifth pipe item.
 * @param item6 The sixth pipe item.
 * @param item7 The seventh pipe item.
 * @param item8 The eighth pipe item.
 * @param item9 The ninth pipe item.
 * @param item10 The tenth pipe item.
 * @param item11 The eleventh pipe item.
 * @param item12 The twelfth pipe item.
 * @param item13 The thirteenth pipe item.
 * @param item14 The fourteenth pipe item.
 * @param item15 The fifteenth pipe item.
 * @param item16 The sixteenth pipe item.
 * @param item17 The seventeenth pipe item.
 * @param item18 The eighteenth pipe item.
 * @param item19 The nineteenth pipe item.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItem1 extends
    | PipeItem<InferOutput<TSchema>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TSchema>, unknown, BaseIssue<unknown>>,
  const TItem2 extends
    | PipeItem<InferOutput<TItem1>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem1>, unknown, BaseIssue<unknown>>,
  const TItem3 extends
    | PipeItem<InferOutput<TItem2>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem2>, unknown, BaseIssue<unknown>>,
  const TItem4 extends
    | PipeItem<InferOutput<TItem3>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem3>, unknown, BaseIssue<unknown>>,
  const TItem5 extends
    | PipeItem<InferOutput<TItem4>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem4>, unknown, BaseIssue<unknown>>,
  const TItem6 extends
    | PipeItem<InferOutput<TItem5>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem5>, unknown, BaseIssue<unknown>>,
  const TItem7 extends
    | PipeItem<InferOutput<TItem6>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem6>, unknown, BaseIssue<unknown>>,
  const TItem8 extends
    | PipeItem<InferOutput<TItem7>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem7>, unknown, BaseIssue<unknown>>,
  const TItem9 extends
    | PipeItem<InferOutput<TItem8>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem8>, unknown, BaseIssue<unknown>>,
  const TItem10 extends
    | PipeItem<InferOutput<TItem9>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem9>, unknown, BaseIssue<unknown>>,
  const TItem11 extends
    | PipeItem<InferOutput<TItem10>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem10>, unknown, BaseIssue<unknown>>,
  const TItem12 extends
    | PipeItem<InferOutput<TItem11>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem11>, unknown, BaseIssue<unknown>>,
  const TItem13 extends
    | PipeItem<InferOutput<TItem12>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem12>, unknown, BaseIssue<unknown>>,
  const TItem14 extends
    | PipeItem<InferOutput<TItem13>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem13>, unknown, BaseIssue<unknown>>,
  const TItem15 extends
    | PipeItem<InferOutput<TItem14>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem14>, unknown, BaseIssue<unknown>>,
  const TItem16 extends
    | PipeItem<InferOutput<TItem15>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem15>, unknown, BaseIssue<unknown>>,
  const TItem17 extends
    | PipeItem<InferOutput<TItem16>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem16>, unknown, BaseIssue<unknown>>,
  const TItem18 extends
    | PipeItem<InferOutput<TItem17>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem17>, unknown, BaseIssue<unknown>>,
  const TItem19 extends
    | PipeItem<InferOutput<TItem18>, unknown, BaseIssue<unknown>>
    | PipeItemAsync<InferOutput<TItem18>, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  item1:
    | TItem1
    | PipeAction<InferOutput<TSchema>, InferOutput<TItem1>, InferIssue<TItem1>>
    | PipeActionAsync<
        InferOutput<TSchema>,
        InferOutput<TItem1>,
        InferIssue<TItem1>
      >,
  item2:
    | TItem2
    | PipeAction<InferOutput<TItem1>, InferOutput<TItem2>, InferIssue<TItem2>>
    | PipeActionAsync<
        InferOutput<TItem1>,
        InferOutput<TItem2>,
        InferIssue<TItem2>
      >,
  item3:
    | TItem3
    | PipeAction<InferOutput<TItem2>, InferOutput<TItem3>, InferIssue<TItem3>>
    | PipeActionAsync<
        InferOutput<TItem2>,
        InferOutput<TItem3>,
        InferIssue<TItem3>
      >,
  item4:
    | TItem4
    | PipeAction<InferOutput<TItem3>, InferOutput<TItem4>, InferIssue<TItem4>>
    | PipeActionAsync<
        InferOutput<TItem3>,
        InferOutput<TItem4>,
        InferIssue<TItem4>
      >,
  item5:
    | TItem5
    | PipeAction<InferOutput<TItem4>, InferOutput<TItem5>, InferIssue<TItem5>>
    | PipeActionAsync<
        InferOutput<TItem4>,
        InferOutput<TItem5>,
        InferIssue<TItem5>
      >,
  item6:
    | TItem6
    | PipeAction<InferOutput<TItem5>, InferOutput<TItem6>, InferIssue<TItem6>>
    | PipeActionAsync<
        InferOutput<TItem5>,
        InferOutput<TItem6>,
        InferIssue<TItem6>
      >,
  item7:
    | TItem7
    | PipeAction<InferOutput<TItem6>, InferOutput<TItem7>, InferIssue<TItem7>>
    | PipeActionAsync<
        InferOutput<TItem6>,
        InferOutput<TItem7>,
        InferIssue<TItem7>
      >,
  item8:
    | TItem8
    | PipeAction<InferOutput<TItem7>, InferOutput<TItem8>, InferIssue<TItem8>>
    | PipeActionAsync<
        InferOutput<TItem7>,
        InferOutput<TItem8>,
        InferIssue<TItem8>
      >,
  item9:
    | TItem9
    | PipeAction<InferOutput<TItem8>, InferOutput<TItem9>, InferIssue<TItem9>>
    | PipeActionAsync<
        InferOutput<TItem8>,
        InferOutput<TItem9>,
        InferIssue<TItem9>
      >,
  item10:
    | TItem10
    | PipeAction<InferOutput<TItem9>, InferOutput<TItem10>, InferIssue<TItem10>>
    | PipeActionAsync<
        InferOutput<TItem9>,
        InferOutput<TItem10>,
        InferIssue<TItem10>
      >,
  item11:
    | TItem11
    | PipeAction<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >
    | PipeActionAsync<
        InferOutput<TItem10>,
        InferOutput<TItem11>,
        InferIssue<TItem11>
      >,
  item12:
    | TItem12
    | PipeAction<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >
    | PipeActionAsync<
        InferOutput<TItem11>,
        InferOutput<TItem12>,
        InferIssue<TItem12>
      >,
  item13:
    | TItem13
    | PipeAction<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >
    | PipeActionAsync<
        InferOutput<TItem12>,
        InferOutput<TItem13>,
        InferIssue<TItem13>
      >,
  item14:
    | TItem14
    | PipeAction<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >
    | PipeActionAsync<
        InferOutput<TItem13>,
        InferOutput<TItem14>,
        InferIssue<TItem14>
      >,
  item15:
    | TItem15
    | PipeAction<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >
    | PipeActionAsync<
        InferOutput<TItem14>,
        InferOutput<TItem15>,
        InferIssue<TItem15>
      >,
  item16:
    | TItem16
    | PipeAction<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >
    | PipeActionAsync<
        InferOutput<TItem15>,
        InferOutput<TItem16>,
        InferIssue<TItem16>
      >,
  item17:
    | TItem17
    | PipeAction<
        InferOutput<TItem16>,
        InferOutput<TItem17>,
        InferIssue<TItem17>
      >
    | PipeActionAsync<
        InferOutput<TItem16>,
        InferOutput<TItem17>,
        InferIssue<TItem17>
      >,
  item18:
    | TItem18
    | PipeAction<
        InferOutput<TItem17>,
        InferOutput<TItem18>,
        InferIssue<TItem18>
      >
    | PipeActionAsync<
        InferOutput<TItem17>,
        InferOutput<TItem18>,
        InferIssue<TItem18>
      >,
  item19:
    | TItem19
    | PipeAction<
        InferOutput<TItem18>,
        InferOutput<TItem19>,
        InferIssue<TItem19>
      >
    | PipeActionAsync<
        InferOutput<TItem18>,
        InferOutput<TItem19>,
        InferIssue<TItem19>
      >
): SchemaWithPipeAsync<
  readonly [
    TSchema,
    TItem1,
    TItem2,
    TItem3,
    TItem4,
    TItem5,
    TItem6,
    TItem7,
    TItem8,
    TItem9,
    TItem10,
    TItem11,
    TItem12,
    TItem13,
    TItem14,
    TItem15,
    TItem16,
    TItem17,
    TItem18,
    TItem19,
  ]
>;

/**
 * Adds a pipeline to a schema, that can validate and transform its input.
 *
 * @param schema The root schema.
 * @param items The pipe items.
 *
 * @returns A schema with a pipeline.
 */
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItems extends readonly (
    | PipeItem<InferOutput<TSchema>, InferOutput<TSchema>, BaseIssue<unknown>>
    | PipeItemAsync<
        InferOutput<TSchema>,
        InferOutput<TSchema>,
        BaseIssue<unknown>
      >
  )[],
>(
  schema: TSchema,
  ...items: TItems
): SchemaWithPipeAsync<readonly [TSchema, ...TItems]>;

// @__NO_SIDE_EFFECTS__
export function pipeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TItems extends readonly (
    | PipeItem<unknown, unknown, BaseIssue<unknown>>
    | PipeItemAsync<unknown, unknown, BaseIssue<unknown>>
  )[],
>(
  ...pipe: [TSchema, ...TItems]
): SchemaWithPipeAsync<readonly [TSchema, ...TItems]> {
  return {
    ...pipe[0],
    pipe,
    async: true,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      // Execute pipeline items in sequence
      for (const item of pipe) {
        // Exclude metadata items from execution
        if (item.kind !== 'metadata') {
          // Mark dataset as untyped and break pipe if there are issues and pipe
          // item is schema or transformation
          if (
            dataset.issues &&
            (item.kind === 'schema' || item.kind === 'transformation')
          ) {
            dataset.typed = false;
            break;
          }

          // Continue pipe execution if there is no reason to abort early
          if (
            !dataset.issues ||
            (!config.abortEarly && !config.abortPipeEarly)
          ) {
            // @ts-expect-error
            dataset = await item['~run'](dataset, config);
          }
        }
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
  };
}
