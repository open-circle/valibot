import type {
  BaseIssue,
  BaseSchema,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { CacheOptions } from '../../utils/index.ts';
import { _Cache, _getStandardProps } from '../../utils/index.ts';
import type { CacheInstanceOptions } from './types.ts';

export type SchemaWithCache<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TOptions extends CacheOptions | CacheInstanceOptions<TSchema> | undefined,
> = TSchema & {
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
};

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 *
 * @returns The cached schema.
 */
export function cache<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SchemaWithCache<TSchema, undefined>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param options Either the cache options or an instance.
 *
 * @returns The cached schema.
 */
export function cache<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TOptions extends
    | CacheOptions
    | CacheInstanceOptions<TSchema>
    | undefined,
>(schema: TSchema, options: TOptions): SchemaWithCache<TSchema, TOptions>;

// @__NO_SIDE_EFFECTS__
export function cache(
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  options?:
    | CacheOptions
    | CacheInstanceOptions<BaseSchema<unknown, unknown, BaseIssue<unknown>>>
): SchemaWithCache<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  | CacheOptions
  | CacheInstanceOptions<BaseSchema<unknown, unknown, BaseIssue<unknown>>>
  | undefined
> {
  return {
    ...schema,
    options,
    cache: options && 'cache' in options ? options.cache : new _Cache(options),
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      let outputDataset = this.cache.get(dataset.value);
      if (!outputDataset) {
        this.cache.set(
          dataset.value,
          (outputDataset = schema['~run'](dataset, config))
        );
      }
      return outputDataset;
    },
  };
}
