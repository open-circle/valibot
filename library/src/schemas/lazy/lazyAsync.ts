import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
  MaybePromise,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';
import type { lazy } from './lazy.ts';

/**
 * Lazy schema async interface.
 */
export interface LazySchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> extends BaseSchemaAsync<
    InferInput<TWrapped>,
    InferOutput<TWrapped>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'lazy';
  /**
   * The schema reference.
   */
  readonly reference: typeof lazy | typeof lazyAsync;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The schema getter.
   */
  readonly getter: (input: unknown) => MaybePromise<TWrapped>;
}

/**
 * Creates a lazy schema.
 *
 * @param getter The schema getter.
 *
 * @returns A lazy schema.
 */
// @__NO_SIDE_EFFECTS__
export function lazyAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  getter: (input: unknown) => MaybePromise<TWrapped>
): LazySchemaAsync<TWrapped> {
  return _standardSchema<LazySchemaAsync<TWrapped>>({
    kind: 'schema',
    type: 'lazy',
    reference: lazyAsync,
    expects: 'unknown',
    async: true,
    getter,
    async '~run'(dataset, config) {
      return (await this.getter(dataset.value))['~run'](dataset, config);
    },
  });
}
