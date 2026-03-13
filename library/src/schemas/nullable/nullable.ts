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
import type { InferNullableOutput } from './types.ts';

export interface NullableModifierHKT extends SchemaMapperHKT {
  result: NullableSchema<this['wrapped'], undefined>;
}

/**
 * Nullable schema interface.
 */
export interface NullableSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends Default<TWrapped, null>,
> extends BaseSchema<
      InferInput<TWrapped> | null,
      InferNullableOutput<TWrapped, TDefault>,
      InferIssue<TWrapped>
    >,
    BaseHKTable<NullableModifierHKT> {
  /**
   * The schema type.
   */
  readonly type: 'nullable';
  /**
   * The schema reference.
   */
  readonly reference: typeof nullable;
  /**
   * The expected property.
   */
  readonly expects: `(${TWrapped['expects']} | null)`;
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
 * Creates a nullable schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A nullable schema.
 */
export function nullable<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NullableSchema<TWrapped, undefined>;

/**
 * Creates a nullable schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns A nullable schema.
 */
export function nullable<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends Default<TWrapped, null>,
>(wrapped: TWrapped, default_: TDefault): NullableSchema<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function nullable(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): NullableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> {
  return {
    kind: 'schema',
    type: 'nullable',
    reference: nullable,
    expects: `(${wrapped.expects} | null)`,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // If value is `null`, override it with default or return dataset
      if (dataset.value === null) {
        // If default is specified, override value of dataset
        if (this.default !== undefined) {
          dataset.value = getDefault(this, dataset, config);
        }

        // If value is still `null`, return dataset
        if (dataset.value === null) {
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
