import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferIssue,
  InferOutput,
  UnknownDataset,
} from '../../types/index.ts';
import { ValiError } from '../../utils/index.ts';

// Reusable dataset frame; safe because parse() is synchronous and non-reentrant
const _dataset: UnknownDataset = { value: undefined, typed: false, issues: undefined };

/**
 * Parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The input to be parsed.
 * @param config The parse configuration.
 *
 * @returns The parsed input.
 */
export function parse<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  config?: Config<InferIssue<TSchema>>
): InferOutput<TSchema> {
  _dataset.value = input;
  _dataset.typed = false;
  _dataset.issues = undefined;
  const dataset = schema['~run'](_dataset, getGlobalConfig(config));
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}
