import type {
  BaseIssue,
  BaseSchema,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { _CacheOptions } from '../../utils/index.ts';
import { _Cache, _getStandardProps } from '../../utils/index.ts';

export type SchemaWithCache<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TOptions extends _CacheOptions | undefined,
> = TSchema & {
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
 * @param options The cache options.
 *
 * @returns The cached schema.
 */
export function cache<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TOptions extends _CacheOptions | undefined,
>(schema: TSchema, options: TOptions): SchemaWithCache<TSchema, TOptions>;

/**
 * Caches the output of a schema.
 *
 * @param schema The schema to cache.
 * @param options The cache options.
 *
 * @returns The cached schema.
 */
// @__NO_SIDE_EFFECTS__
export function cache(
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  options?: _CacheOptions
): SchemaWithCache<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  _CacheOptions | undefined
> {
  return {
    ...schema,
    options,
    cache: new _Cache(options),
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
