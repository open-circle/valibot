import { getDefault } from '../../methods/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Default,
  InferInput,
  InferIssue,
  SuccessDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import type { InferNullishOutput } from './types.ts';

/**
 * Nullish schema interface.
 */
export interface NullishSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends Default<TWrapped, null | undefined>,
> extends BaseSchema<
    InferInput<TWrapped> | null | undefined,
    InferNullishOutput<TWrapped, TDefault>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'nullish';
  /**
   * The schema reference.
   */
  readonly reference: typeof nullish;
  /**
   * The expected property.
   */
  readonly expects: `(${TWrapped['expects']} | null | undefined)`;
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
 * Creates a nullish schema that allows null and undefined values.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A nullish schema.
 */
export function nullish<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NullishSchema<TWrapped, undefined>;

/**
 * Creates a nullish schema that allows null and undefined values.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns A nullish schema.
 */
export function nullish<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends Default<TWrapped, null | undefined>,
>(wrapped: TWrapped, default_: TDefault): NullishSchema<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function nullish(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): NullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> {
  return {
    kind: 'schema',
    type: 'nullish',
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // If value is `null` or `undefined`, override it with default or return
      // dataset
      if (dataset.value === null || dataset.value === undefined) {
        // If default is specified, override value of dataset
        if (this.default !== undefined) {
          dataset.value = getDefault(this, dataset, config);
        }

        // If value is still `null` or `undefined`, return dataset
        if (dataset.value === null || dataset.value === undefined) {
          // @ts-expect-error
          dataset.typed = true;
          // @ts-expect-error
          return dataset as SuccessDataset<unknown>;
        }
      }

      // Otherwise, return dataset of wrapped schema
      return this.wrapped['~run'](dataset, config);
    },
  };
}
