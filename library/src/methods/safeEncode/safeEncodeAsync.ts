import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import {
  _runBackwardPipe,
  _runBackwardPipeAsync,
} from '../../utils/_runBackwardPipe/index.ts';
import type { SafeEncodeResult } from '../safeEncode/types.ts';

/**
 * Encodes a typed value based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The value to encode.
 * @param config The parse configuration.
 *
 * @returns The parse result.
 */
// @__NO_SIDE_EFFECTS__
export async function safeEncodeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferOutput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): Promise<SafeEncodeResult<TSchema>> {
  const dataset = await schema['~run'](
    { value: input },
    {
      ...getGlobalConfig(config),
      '~direction': 'encode',
      '~runPipe': _runBackwardPipe,
      '~runPipeAsync': _runBackwardPipeAsync,
    }
  );
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues,
  } as SafeEncodeResult<TSchema>;
}
