import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import { _LruCache } from './_LruCache.ts';
import type { Cache2, CacheConfig2 } from './types.ts';

/**
 * Schema with cache2 async type.
 */
export type SchemaWithCache2Async<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TCacheConfig extends CacheConfig2 | undefined,
> = Omit<TSchema, 'async' | '~standard' | '~run'> & {
  /**
   * Whether it's async.
   */
  readonly async: true;

  /**
   * The cache config.
   */
  readonly cacheConfig: TCacheConfig;

  /**
   * The cache instance.
   */
  readonly cache: Cache2<
    OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>
  >;

  /**
   * The Standard Schema properties.
   *
   * @internal
   */
  readonly '~standard': StandardProps<
    InferInput<TSchema>,
    InferOutput<TSchema>
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
// @ts-expect-error
export function cache2Async<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaWithCache2Async<TSchema, undefined>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param config The cache config.
 *
 * @returns The cached schema.
 */
export function cache2Async<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TCacheConfig extends CacheConfig2 | undefined,
>(
  schema: TSchema,
  config: TCacheConfig
): SchemaWithCache2Async<TSchema, TCacheConfig>;

// @__NO_SIDE_EFFECTS__
export function cache2Async(
  schema:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  config?: CacheConfig2
): SchemaWithCache2Async<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  CacheConfig2 | undefined
> {
  const pending = new Map<
    unknown,
    Promise<OutputDataset<unknown, BaseIssue<unknown>>>
  >();
  return {
    ...schema,
    async: true,
    cacheConfig: config,
    cache: new _LruCache(config),
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, runConfig) {
      // Key to access cache and pending map
      const key = dataset.value;

      // Check and return cached output if exists
      const cached = this.cache.get(key);
      if (cached) return cached;

      // If not cached, check if key is pending
      let promise = pending.get(key);
      if (!promise) {
        promise = Promise.resolve(schema['~run'](dataset, runConfig));
        pending.set(key, promise);
      }

      // Await pending promise, cache output and return
      try {
        const outputDataset = await promise;
        this.cache.set(key, outputDataset);
        return outputDataset;

        // Cleanup pending map
      } finally {
        pending.delete(key);
      }
    },
  };
}
