import { getGlobalConfig } from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferOutput,
  StandardProps,
  StandardResult,
} from '../../types/index.ts';

// Cache to avoid allocating a new StandardProps object on every `~standard` access
const _standardCache = new WeakMap<object, StandardProps<unknown, unknown>>();

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
        return context['~run']({ value }, getGlobalConfig()) as
          | StandardResult<InferOutput<TSchema>>
          | Promise<StandardResult<InferOutput<TSchema>>>;
      },
    };
    _standardCache.set(context, cached);
  }
  return cached as StandardProps<InferInput<TSchema>, InferOutput<TSchema>>;
}
