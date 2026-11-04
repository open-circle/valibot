import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { parseAsync } from '../parse/parseAsync.ts';

/**
 * Decodes a typed value based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The value to decode.
 * @param config The parse configuration.
 *
 * @returns The decoded value.
 */
export function decodeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferInput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): Promise<InferOutput<TSchema>> {
  return parseAsync(schema, input, config);
}
