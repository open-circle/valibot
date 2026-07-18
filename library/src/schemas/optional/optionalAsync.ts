import { getDefault } from '../../methods/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  DefaultAsync,
  InferInput,
  InferIssue,
  SuccessDataset,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';
import type { optional } from './optional.ts';
import type { InferOptionalOutput } from './types.ts';

/**
 * Optional schema async interface.
 */
export interface OptionalSchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TDefault extends DefaultAsync<TWrapped, undefined>,
> extends BaseSchemaAsync<
    InferInput<TWrapped> | undefined,
    InferOptionalOutput<TWrapped, TDefault>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'optional';
  /**
   * The schema reference.
   */
  readonly reference: typeof optional | typeof optionalAsync;
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
export function optionalAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): OptionalSchemaAsync<TWrapped, undefined>;

/**
 * Creates an optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An optional schema.
 */
export function optionalAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TDefault extends DefaultAsync<TWrapped, undefined>,
>(
  wrapped: TWrapped,
  default_: TDefault
): OptionalSchemaAsync<TWrapped, TDefault>;

// @__NO_SIDE_EFFECTS__
export function optionalAsync(
  wrapped:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  default_?: unknown
): OptionalSchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  unknown
> {
  return _standardSchema<
    OptionalSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  >({
    kind: 'schema',
    type: 'optional',
    reference: optionalAsync,
    expects: `(${wrapped.expects} | undefined)`,
    async: true,
    wrapped,
    default: default_,
    async '~run'(
      this: OptionalSchemaAsync<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        unknown
      >,
      dataset,
      config
    ) {
      // If value is `undefined`, override it with default or return dataset
      if (dataset.value === undefined) {
        // If default is specified, override value of dataset
        if (this.default !== undefined) {
          dataset.value = await getDefault(this, dataset, config);
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
