import { getDefault } from '../../methods/getDefault/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Default,
  InferInput,
  InferIssue,
  SuccessDataset,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';
import type { InferUndefinedableOutput } from './types.ts';

/**
 * Undefinedable schema interface.
 */
export interface UndefinedableSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends Default<TWrapped, undefined>,
> extends BaseSchema<
    InferInput<TWrapped> | undefined,
    InferUndefinedableOutput<TWrapped, TDefault>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'undefinedable';
  /**
   * The schema reference.
   */
  readonly reference: typeof undefinedable;
  /**
   * The expected property.
   */
  readonly expects: `(${TWrapped['expects']} | undefined)`;
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
  /**
   * The default value.
   */
  readonly default: TDefault;
}

/**
 * Creates an undefinedable schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns An undefinedable schema.
 */
export function undefinedable<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): UndefinedableSchema<TWrapped, undefined>;

/**
 * Creates an undefinedable schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An undefinedable schema.
 */
export function undefinedable<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends Default<TWrapped, undefined>,
>(
  wrapped: TWrapped,
  default_: TDefault
): UndefinedableSchema<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function undefinedable(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): UndefinedableSchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  unknown
> {
  return _standardSchema<
    UndefinedableSchema<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  >({
    kind: 'schema',
    type: 'undefinedable',
    reference: undefinedable,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    '~run'(
      this: UndefinedableSchema<
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        unknown
      >,
      dataset,
      config
    ) {
      // If value is `undefined`, override it with default or return dataset
      if (dataset.value === undefined) {
        // If default is specified, override value of dataset
        if (this.default !== undefined) {
          dataset.value = getDefault(this, dataset, config);
        }

        // If value is still `undefined`, return dataset
        if (dataset.value === undefined) {
          // @ts-expect-error
          dataset.typed = true;
          // @ts-expect-error
          return dataset as SuccessDataset<unknown>;
        }
      }

      // Otherwise, return dataset of wrapped schema
      return this.wrapped['~run'](dataset, config);
    },
  });
}
