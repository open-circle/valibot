import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
  MaybePromise,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
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
  readonly getter: (
    input: unknown,
    signal?: AbortSignal
  ) => MaybePromise<TWrapped>;
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
  getter: (input: unknown, signal?: AbortSignal) => MaybePromise<TWrapped>
): LazySchemaAsync<TWrapped> {
  return {
    kind: 'schema',
    type: 'lazy',
    reference: lazyAsync,
    expects: 'unknown',
    async: true,
    getter,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      return (await this.getter(dataset.value, config.signal))['~run'](
        dataset,
        config
      );
    },
  };
}
