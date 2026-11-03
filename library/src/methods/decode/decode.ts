import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { parse } from '../parse/parse.ts';

/**
 * Decodes a typed value based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The input to be decoded.
 * @param config The decode configuration.
 *
 * @returns The decoded input.
 */
export function decode<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferInput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): InferOutput<TSchema> {
  return parse(schema, input, config);
}
