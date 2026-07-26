import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
  MaybeDeepReadonly,
  MaybePromise,
  OutputDataset,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import { getFallback } from '../getFallback/index.ts';

/**
 * Fallback async type.
 */
export type FallbackAsync<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> =
  | MaybeDeepReadonly<InferOutput<TSchema>>
  | ((
      dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>,
      config?: Config<InferIssue<TSchema>>
    ) => MaybePromise<MaybeDeepReadonly<InferOutput<TSchema>>>);

/**
 * Schema with fallback async type.
 */
export type SchemaWithFallbackAsync<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TFallback extends FallbackAsync<TSchema>,
> = Omit<TSchema, 'async' | '~standard' | '~run'> & {
  /**
   * The fallback value.
   */
  readonly fallback: TFallback;
  /**
   * Whether it's async.
   */
  readonly async: true;
  /**
   * The Standard Schema properties.
   *
   * @internal
   */
  readonly '~standard': StandardProps<
    InferInput<TSchema>,
    InferOutput<TSchema>
  >;
  /**
   * Parses unknown input values.
   *
   * @param dataset The input dataset.
   * @param config The configuration.
   *
   * @returns The output dataset.
   *
   * @internal
   */
  readonly '~run': (
    dataset: UnknownDataset,
    config: Config<BaseIssue<unknown>>
  ) => Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>>;
};

/**
 * Returns a fallback value as output if the input does not match the schema.
 *
 * @param schema The schema to catch.
 * @param fallback The fallback value.
 *
 * @returns The passed schema.
 */
// @__NO_SIDE_EFFECTS__
export function fallbackAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TFallback extends FallbackAsync<TSchema>,
>(
  schema: TSchema,
  fallback: TFallback
): SchemaWithFallbackAsync<TSchema, TFallback> {
  return {
    ...schema,
    fallback,
    async: true,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      const outputDataset = await schema['~run'](dataset, config);
      return outputDataset.issues
        ? {
            typed: true,
            value: await getFallback(this, outputDataset, config),
          }
        : outputDataset;
    },
  };
}
