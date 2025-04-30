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
import type { CacheOptions } from '../../utils/index.ts';
import { _Cache, _getStandardProps } from '../../utils/index.ts';
import type { CacheInstanceOptions } from './types.ts';

export type SchemaWithCacheAsync<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TOptions extends CacheOptions | CacheInstanceOptions<TSchema> | undefined,
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
  readonly cache: TOptions extends { cache: infer TCache }
    ? TCache
    : _Cache<unknown, OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;

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
// @ts-expect-error
export function cacheAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaWithCacheAsync<TSchema, undefined>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param options Either the cache options or an instance.
 *
 * @returns The cached schema.
 */
export function cacheAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TOptions extends
    | CacheOptions
    | CacheInstanceOptions<TSchema>
    | undefined,
>(schema: TSchema, options: TOptions): SchemaWithCacheAsync<TSchema, TOptions>;

// @__NO_SIDE_EFFECTS__
export function cacheAsync(
  schema:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  options?:
    | CacheOptions
    | CacheInstanceOptions<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
      >
): SchemaWithCacheAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  | CacheOptions
  | CacheInstanceOptions<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    >
  | undefined
> {
  return {
    ...schema,
    async: true,
    options,
    cache: options && 'cache' in options ? options.cache : new _Cache(options),
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
