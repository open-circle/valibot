import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferIssue,
  InferOutput,
  MaybeReadonly,
  OutputDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';
import { getFallback } from '../getFallback/index.ts';

/**
 * Fallback type.
 */
export type Fallback<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TFallbackSchema = MaybeReadonly<InferOutput<TSchema>>
> =
  | {
    [key in keyof TFallbackSchema as TFallbackSchema[key] extends SchemaWithFallback<any, any> ? never : key]: TFallbackSchema[key];
    } & {
      [key in keyof TFallbackSchema as TFallbackSchema[key] extends SchemaWithFallback<any, any> ? key : never]?: TFallbackSchema[key];
    }
  | ((
      dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>,
      config?: Config<InferIssue<TSchema>>
    ) => ({
      [key in keyof TFallbackSchema]: TFallbackSchema[key] extends SchemaWithFallback<any, any>
      ? TFallbackSchema[key]
      : TFallbackSchema[key];
    } & {
      [key in keyof TFallbackSchema as TFallbackSchema[key] extends SchemaWithFallback<any, any> ? key : never]?: TFallbackSchema[key];
    }));

/**
 * Schema with fallback type.
 */
export type SchemaWithFallback<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TFallback extends Fallback<TSchema>,
> = TSchema & {
  /**
   * The fallback value.
   */
  readonly fallback: TFallback;
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
export function fallback<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TFallback extends Fallback<TSchema>,
>(
  schema: TSchema,
  fallback: TFallback
): SchemaWithFallback<TSchema, TFallback> {
  return {
    ...schema,
    fallback,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      const outputDataset = schema['~run'](dataset, config);
      return outputDataset.issues
        ? { typed: true, value: getFallback(this, outputDataset, config) }
        : outputDataset;
    },
  };
}
