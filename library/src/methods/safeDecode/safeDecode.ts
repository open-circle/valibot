import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferInput,
  InferIssue,
} from '../../types/index.ts';
import { safeParse } from '../safeParse/safeParse.ts';
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
export function safeDecode<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferInput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): SafeParseResult<TSchema> {
  return safeParse(schema, input, config);
}
