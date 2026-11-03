import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { _runBackwardPipe } from '../../utils/_runBackwardPipe/index.ts';
import { ValiError } from '../../utils/index.ts';

/**
 * Encodes a typed value based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The input to be encoded.
 * @param config The encode configuration.
 *
 * @returns The encoded input.
 */
export function encode<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: InferOutput<TSchema>,
  config?: Config<InferIssue<TSchema>>
): InferInput<TSchema> {
  const dataset = schema['~run'](
    { value: input },
    {
      ...getGlobalConfig(config),
      '~direction': 'encode',
      '~runPipe': _runBackwardPipe,
    }
  );
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}
