import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  BaseTransformation,
  InferOutput,
  SuccessDataset,
} from '../../types/index.ts';
import { ValiError } from '../../utils/index.ts';

/**
 * Returns action async type.
 */
export interface ReturnsActionAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> extends BaseTransformation<
    TInput,
    (...args: Parameters<TInput>) => Promise<Awaited<InferOutput<TSchema>>>,
    never
  > {
  /**
   * The action type.
   */
  readonly type: 'returns';
  /**
   * The action reference.
   */
  readonly reference: typeof returnsAsync;
  /**
   * The arguments schema.
   */
  readonly schema: TSchema;
}

/**
 * Creates a function arguments transformation action.
 *
 * @param schema The arguments schema.
 *
 * @returns An returns action.
 */
export function returnsAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): ReturnsActionAsync<TInput, TSchema>;

// @__NO_SIDE_EFFECTS__
export function returnsAsync(
  schema:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
): ReturnsActionAsync<
  (...args: unknown[]) => unknown,
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
> {
  return {
    kind: 'transformation',
    type: 'returns',
    reference: returnsAsync,
    async: false,
    schema,
    '~run'(dataset, config) {
      const func = dataset.value;
      dataset.value = async (...args_) => {
        const returnsDataset = await this.schema['~run'](
          { value: await func(...args_) },
          config
        );
        if (returnsDataset.issues) {
          throw new ValiError(returnsDataset.issues);
        }
        return returnsDataset.value;
      };
      return dataset as SuccessDataset<
        (...args: unknown[]) => Promise<unknown>
      >;
    },
  };
}
