import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferIssue,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

/**
 * Changes the local message configuration of a schema.
 *
 * @param schema The schema to configure.
 * @param message_ The error message.
 *
 * @returns The configured schema.
 */
// @__NO_SIDE_EFFECTS__
export function message<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, message_: ErrorMessage<InferIssue<TSchema>>): TSchema {
  return {
    ...schema,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      return schema['~run'](dataset, { ...config, message: message_ });
    },
  };
}
