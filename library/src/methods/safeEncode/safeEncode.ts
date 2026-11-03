import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _runBackwardPipe } from '../../utils/_runBackwardPipe/index.ts';
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
export function safeEncode<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferOutput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): SafeEncodeResult<TSchema> {
  const dataset = schema['~run'](
    { value: input },
    {
      ...getGlobalConfig(config),
      '~direction': 'backward',
      '~runPipe': _runBackwardPipe,
    }
  );
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues,
  } as SafeEncodeResult<TSchema>;
}
