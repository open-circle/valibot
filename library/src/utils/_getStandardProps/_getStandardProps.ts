import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferOutput,
  OutputDataset,
  StandardProps,
  StandardResult,
} from '../../types/index.ts';

// Cache to avoid allocating a new StandardProps object on every `~standard` access
const _standardCache = new WeakMap<object, StandardProps<unknown, unknown>>();

/**
 * Converts a Valibot output dataset into a Standard Schema result. The Standard
 * Schema contract requires a discriminated union: a success result exposes only
 * `value` and a failure result exposes only `issues`. Valibot's dataset always
 * carries `typed` and `value`, so it must be mapped explicitly to avoid leaking
 * `value`/`typed` next to `issues` on failure.
 *
 * @param dataset The Valibot output dataset.
 *
 * @returns The Standard Schema result.
 */
// @__NO_SIDE_EFFECTS__
function _toStandardResult<TOutput>(
  dataset: OutputDataset<TOutput, BaseIssue<unknown>>
): StandardResult<TOutput> {
  return dataset.issues
    ? { issues: dataset.issues }
    : { value: dataset.value };
}

/**
 * Returns the Standard Schema properties.
 *
 * @param context The schema context.
 *
 * @returns The Standard Schema properties.
 */
// @__NO_SIDE_EFFECTS__
export function _getStandardProps<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(context: TSchema): StandardProps<InferInput<TSchema>, InferOutput<TSchema>> {
  let cached = _standardCache.get(context);
  if (!cached) {
    cached = {
      version: 1,
      vendor: 'valibot',
      validate(value) {
        const dataset = context['~run']({ value }, getGlobalConfig());
        return dataset instanceof Promise
          ? dataset.then(_toStandardResult)
          : _toStandardResult(dataset);
      },
    };
    _standardCache.set(context, cached);
  }
  return cached as StandardProps<InferInput<TSchema>, InferOutput<TSchema>>;
}
