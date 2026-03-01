import { getDefault } from '../../methods/index.ts';
import type { SchemaMapperHKT } from '../../methods/mapEntries/mapEntries.ts';
import type {
  BaseHKTable,
  BaseIssue,
  BaseSchema,
  Default,
  InferInput,
  InferIssue,
  SuccessDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import type { InferOptionalOutput } from './types.ts';

export interface OptionalModifierHKT extends SchemaMapperHKT {
  result: OptionalSchema<this['wrapped'], undefined>;
}

/**
 * Optional schema interface.
 */
export interface OptionalSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends Default<TWrapped, undefined>,
> extends BaseSchema<
      InferInput<TWrapped> | undefined,
      InferOptionalOutput<TWrapped, TDefault>,
      InferIssue<TWrapped>
    >,
    BaseHKTable<OptionalModifierHKT> {
  /**
   * The schema type.
   */
  readonly type: 'optional';
  /**
   * The schema reference.
   */
  readonly reference: typeof optional;
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
 * Creates an optional schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns An optional schema.
 */
export function optional<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): OptionalSchema<TWrapped, undefined>;

/**
 * Creates an optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An optional schema.
 */
export function optional<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends Default<TWrapped, undefined>,
>(wrapped: TWrapped, default_: TDefault): OptionalSchema<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function optional(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> {
  return {
    kind: 'schema',
    type: 'optional',
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
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
    '~preferHkt': true,
  };
}
