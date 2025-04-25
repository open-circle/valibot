import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferIssue,
  InferOutput,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';
import type { _CacheOptions } from '../../utils/index.ts';
import { _Cache, _getStandardProps } from '../../utils/index.ts';

export type SchemaWithCacheAsync<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TOptions extends _CacheOptions | undefined,
> = Omit<TSchema, 'async' | '~run'> & {
  /**
   * Whether it's async.
   */
  readonly async: true;

  /**
   * The cache options.
   */
  readonly options: Readonly<TOptions>;

  /**
   * The cache instance.
   */
  readonly cache: _Cache<
    unknown,
    OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>
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
  ) => Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 *
 * @returns The cached schema.
 */
export function cacheAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaWithCacheAsync<TSchema, undefined>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param options The cache options.
 *
 * @returns The cached schema.
 */
export function cacheAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TOptions extends _CacheOptions | undefined,
>(schema: TSchema, options: TOptions): SchemaWithCacheAsync<TSchema, TOptions>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param options The cache options.
 *
 * @returns The cached schema.
 */
// @__NO_SIDE_EFFECTS__
export function cacheAsync(
  schema:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  options?: _CacheOptions
): SchemaWithCacheAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  _CacheOptions | undefined
> {
  return {
    ...schema,
    async: true,
    options,
    cache: new _Cache(options),
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      let outputDataset = this.cache.get(dataset.value);
      if (!outputDataset) {
        this.cache.set(
          dataset.value,
          (outputDataset = await schema['~run'](dataset, config))
        );
      }
      return outputDataset;
    },
  };
}
