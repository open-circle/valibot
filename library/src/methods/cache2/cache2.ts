import type { OutputDataset } from '../../types/dataset.ts';
import type {
  BaseIssue,
  BaseSchema,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import { _LruCache } from './_LruCache.ts';
import type { Cache2, CacheConfig2 } from './types.ts';

/**
 * Schema with cache2 type.
 */
export type SchemaWithCache2<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TCacheConfig extends CacheConfig2 | undefined,
> = TSchema & {
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
};

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 *
 * @returns The cached schema.
 */
export function cache2<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaWithCache2<TSchema, undefined>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param config The cache config.
 *
 * @returns The cached schema.
 */
export function cache2<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TCacheConfig extends CacheConfig2 | undefined,
>(
  schema: TSchema,
  config: TCacheConfig
): SchemaWithCache2<TSchema, TCacheConfig>;

// @__NO_SIDE_EFFECTS__
export function cache2(
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  config?: CacheConfig2
): SchemaWithCache2<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  CacheConfig2 | undefined
> {
  return {
    ...schema,
    cacheConfig: config,
    cache: new _LruCache(config),
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, runConfig) {
      let outputDataset = this.cache.get(dataset.value);
      if (!outputDataset) {
        this.cache.set(
          dataset.value,
          (outputDataset = schema['~run'](dataset, runConfig))
        );
      }
      return outputDataset;
    },
  };
}
