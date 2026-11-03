import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import {
  _runBackwardPipe,
  _runBackwardPipeAsync,
} from '../../utils/_runBackwardPipe/index.ts';
import { ValiError } from '../../utils/index.ts';

/**
 * Encodes a typed value based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The value to encode.
 * @param config The parse configuration.
 *
 * @returns The encoded value.
 */
export async function encodeAsync<
  const TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferOutput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): Promise<InferInput<TSchema>> {
  const dataset = await schema['~run'](
    { value: input },
    {
      ...getGlobalConfig(config),
      '~direction': 'backward',
      '~runPipe': _runBackwardPipe,
      '~runPipeAsync': _runBackwardPipeAsync,
    }
  );
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}
