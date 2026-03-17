import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferIssue,
  InferOutput,
  MaybeDeepReadonly,
  MaybePromise,
  OutputDataset,
} from '../../types/index.ts';
import type {
  SchemaWithFallback,
  SchemaWithFallbackAsync,
} from '../fallback/index.ts';

/**
 * Infer fallback type.
 */
export type InferFallback<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TSchema extends
  | SchemaWithFallback<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      infer TFallback
    >
  | SchemaWithFallbackAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      infer TFallback
    >
  ? TFallback extends MaybeDeepReadonly<InferOutput<TSchema>>
    ? TFallback
    : TFallback extends () => MaybePromise<
          MaybeDeepReadonly<InferOutput<TSchema>>
        >
      ? ReturnType<TFallback>
      : never
  : undefined;

/**
 * Returns the fallback value of the schema.
 *
 * @param schema The schema to get it from.
 * @param dataset The output dataset if available.
 * @param config The config if available.
 *
 * @returns The fallback value.
 */
// @__NO_SIDE_EFFECTS__
export function getFallback<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>,
  config?: Config<InferIssue<TSchema>>
): InferFallback<TSchema> {
  // @ts-expect-error
  return typeof schema.fallback === 'function'
    ? // @ts-expect-error
      schema.fallback(dataset, config)
    : // @ts-expect-error
      schema.fallback;
}
