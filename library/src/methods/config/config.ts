import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferIssue,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';

/**
 * Changes the local configuration of a schema.
 *
 * @param schema The schema to configure.
 * @param config The parse configuration.
 *
 * @returns The configured schema.
 */
// @__NO_SIDE_EFFECTS__
export function config<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, config: Config<InferIssue<TSchema>>): TSchema {
  return _standardSchema<TSchema>({
    ...schema,
    '~run'(dataset, config_) {
      return schema['~run'](dataset, { ...config_, ...config });
    },
  });
}
