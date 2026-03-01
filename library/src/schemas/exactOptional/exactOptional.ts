import type { SchemaMapperHKT } from '../../methods/mapEntries/mapEntries.ts';
import type {
  BaseHKTable,
  BaseIssue,
  BaseSchema,
  Default,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

export interface ExactOptionalModifierHKT extends SchemaMapperHKT {
  result: ExactOptionalSchema<this['wrapped'], undefined>;
}

/**
 * Exact optional schema interface.
 */
export interface ExactOptionalSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends Default<TWrapped, never>,
> extends BaseSchema<
      InferInput<TWrapped>,
      InferOutput<TWrapped>,
      InferIssue<TWrapped>
    >,
    BaseHKTable<ExactOptionalModifierHKT> {
  /**
   * The schema type.
   */
  readonly type: 'exact_optional';
  /**
   * The schema reference.
   */
  readonly reference: typeof exactOptional;
  /**
   * The expected property.
   */
  readonly expects: TWrapped['expects'];
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
 * Creates an exact optional schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns An exact optional schema.
 */
export function exactOptional<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): ExactOptionalSchema<TWrapped, undefined>;

/**
 * Creates an exact optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An exact optional schema.
 */
export function exactOptional<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends Default<TWrapped, never>,
>(
  wrapped: TWrapped,
  default_: TDefault
): ExactOptionalSchema<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function exactOptional(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): ExactOptionalSchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  unknown
> {
  return {
    kind: 'schema',
    type: 'exact_optional',
    reference: exactOptional,
    expects: wrapped.expects,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      return this.wrapped['~run'](dataset, config);
    },
    '~preferHkt': true,
  };
}
