import type {
  BaseIssue,
  BaseSchema,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';

/**
 * Lazy schema interface.
 */
export interface LazySchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
> extends BaseSchema<
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
  readonly reference: typeof lazy;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The schema getter.
   */
  readonly getter: (input: unknown) => TWrapped;
}

/**
 * Creates a lazy schema.
 *
 * @param getter The schema getter.
 *
 * @returns A lazy schema.
 */
// @__NO_SIDE_EFFECTS__
export function lazy<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(getter: (input: unknown) => TWrapped): LazySchema<TWrapped> {
  return _standardSchema<LazySchema<TWrapped>>({
    kind: 'schema',
    type: 'lazy',
    reference: lazy,
    expects: 'unknown',
    async: false,
    getter,
    '~run'(dataset, config) {
      return this.getter(dataset.value)['~run'](dataset, config);
    },
  });
}
