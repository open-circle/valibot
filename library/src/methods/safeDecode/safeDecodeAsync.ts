import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
} from '../../types/index.ts';
import { safeParseAsync } from '../safeParse/safeParseAsync.ts';
import type { SafeParseResult } from '../safeParse/types.ts';

/**
 * Decodes a typed value based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The value to decode.
 * @param config The parse configuration.
 *
 * @returns The parse result.
 */
// @__NO_SIDE_EFFECTS__
export function safeDecodeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferInput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): Promise<SafeParseResult<TSchema>> {
  return safeParseAsync(schema, input, config);
}
