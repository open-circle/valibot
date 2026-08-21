import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  DefaultAsync,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';
import type { exactOptional } from './exactOptional.ts';

/**
 * Exact optional schema async interface.
 */
export interface ExactOptionalSchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends DefaultAsync<TWrapped, never>,
> extends BaseSchemaAsync<
    InferInput<TWrapped>,
    InferOutput<TWrapped>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'exact_optional';
  /**
   * The schema reference.
   */
  readonly reference: typeof exactOptional | typeof exactOptionalAsync;
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
export function exactOptionalAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): ExactOptionalSchemaAsync<TWrapped, undefined>;

/**
 * Creates an exact optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An exact optional schema.
 */
export function exactOptionalAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends DefaultAsync<TWrapped, never>,
>(
  wrapped: TWrapped,
  default_: TDefault
): ExactOptionalSchemaAsync<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function exactOptionalAsync(
  wrapped:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): ExactOptionalSchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  unknown
> {
  return _standardSchema<
    ExactOptionalSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  >({
    kind: 'schema',
    type: 'exact_optional',
    reference: exactOptionalAsync,
    expects: wrapped.expects,
    async: true,
    wrapped,
    default: default_,
    async '~run'(dataset, config) {
      return this.wrapped['~run'](dataset, config);
    },
  });
}
