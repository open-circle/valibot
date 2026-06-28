import { getDefault } from '../../methods/getDefault/index.ts';
import { getFallback } from '../../methods/getFallback/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  ObjectEntries,
  ObjectEntriesAsync,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';
import { _addIssue } from '../_addIssue/index.ts';
import { _addPathIssues } from '../_addPathIssues/index.ts';

/**
 * Object entries context type.
 */
interface ObjectEntriesContext<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
> extends BaseSchema<unknown, unknown, BaseIssue<unknown>> {
  /**
   * The entries schema.
   */
  readonly entries: TEntries;
}

/**
 * Object entries context async type.
 */
interface ObjectEntriesContextAsync<TEntries extends ObjectEntriesAsync>
  extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>> {
  /**
   * The entries schema.
   */
  readonly entries: TEntries;
}

/**
 * Object entry schema type.
 */
type ObjectEntrySchema = ObjectEntries[string] | ObjectEntriesAsync[string];

/**
 * Object entry result type.
 */
type ObjectEntryResult = readonly [
  key: string,
  value: unknown,
  schema: ObjectEntrySchema,
  dataset: OutputDataset<unknown, BaseIssue<unknown>> | null,
];

/**
 * Checks if an object entry schema accepts missing input.
 *
 * @param schema The object entry schema.
 *
 * @returns Whether the schema accepts missing input.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
function _isOptionalEntry(schema: ObjectEntrySchema): boolean {
  return (
    schema.type === 'exact_optional' ||
    schema.type === 'optional' ||
    schema.type === 'nullish'
  );
}

/**
 * Parses declared object entries.
 *
 * @param context The object entries context.
 * @param dataset The parent dataset.
 * @param config The configuration.
 * @param input The input object.
 *
 * @returns Whether parsing aborted early.
 *
 * @internal
 */
export function _parseObjectEntries(
  context: ObjectEntriesContext<ObjectEntries>,
  dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>,
  config: Config<BaseIssue<unknown>>,
  input: object
): boolean {
  const object = input as Record<string, unknown>;

  // Set typed to `true` and value to blank object
  dataset.typed = true;
  dataset.value = {};

  // Process each object entry of schema
  for (const key in context.entries) {
    const valueSchema = context.entries[key];

    // If key is present or its an optional schema with a default value,
    // parse input of key or default value
    if (
      key in input ||
      (_isOptionalEntry(valueSchema) &&
        'default' in valueSchema &&
        valueSchema.default !== undefined)
    ) {
      const value: unknown =
        key in input ? object[key] : getDefault(valueSchema);
      const valueDataset = valueSchema['~run']({ value }, config);

      // If there are issues, capture them
      if (valueDataset.issues) {
        _addPathIssues(
          dataset,
          {
            type: 'object',
            origin: 'value',
            input: object,
            key,
            value,
          },
          valueDataset.issues
        );

        // If necessary, abort early
        if (config.abortEarly) {
          dataset.typed = false;
          return true;
        }
      }

      // If not typed, set typed to `false`
      if (!valueDataset.typed) {
        dataset.typed = false;
      }

      // Add entry to dataset
      (dataset.value as Record<string, unknown>)[key] = valueDataset.value;

      // If key is missing but has a fallback, use it
    } else if (
      'fallback' in valueSchema &&
      valueSchema.fallback !== undefined
    ) {
      (dataset.value as Record<string, unknown>)[key] =
        getFallback(valueSchema);

      // Otherwise, add issue if entry is required
    } else if (!_isOptionalEntry(valueSchema)) {
      _addIssue(context, 'key', dataset, config, {
        input: undefined,
        expected: `"${key}"`,
        path: [
          {
            type: 'object',
            origin: 'key',
            input: object,
            key,
            value: object[key],
          },
        ],
      });

      // If necessary, abort early
      if (config.abortEarly) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Collects declared object entry datasets asynchronously.
 *
 * @param context The object entries context.
 * @param config The configuration.
 * @param input The input object.
 *
 * @returns The object entry results.
 *
 * @internal
 */
export async function _collectObjectEntriesAsync(
  context: ObjectEntriesContextAsync<ObjectEntriesAsync>,
  config: Config<BaseIssue<unknown>>,
  input: object
): Promise<ObjectEntryResult[]> {
  const object = input as Record<string, unknown>;
  return Promise.all(
    Object.entries(context.entries).map(async ([key, valueSchema]) => {
      if (
        key in input ||
        (_isOptionalEntry(valueSchema) &&
          'default' in valueSchema &&
          valueSchema.default !== undefined)
      ) {
        const value: unknown =
          key in input ? object[key] : await getDefault(valueSchema);
        return [
          key,
          value,
          valueSchema,
          await valueSchema['~run']({ value }, config),
        ] as const;
      }
      return [key, object[key], valueSchema, null] as const;
    })
  );
}

/**
 * Applies declared object entry datasets asynchronously.
 *
 * @param context The object entries context.
 * @param dataset The parent dataset.
 * @param config The configuration.
 * @param input The input object.
 * @param results The object entry results.
 *
 * @returns Whether parsing aborted early.
 *
 * @internal
 */
export async function _applyObjectEntriesAsync(
  context: ObjectEntriesContextAsync<ObjectEntriesAsync>,
  dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>,
  config: Config<BaseIssue<unknown>>,
  input: object,
  results: ObjectEntryResult[]
): Promise<boolean> {
  const object = input as Record<string, unknown>;

  // Set typed to `true` and value to blank object
  dataset.typed = true;
  dataset.value = {};

  // Process each object entry result
  for (const [key, value, valueSchema, valueDataset] of results) {
    // If entry has a dataset, process it
    if (valueDataset) {
      // If there are issues, capture them
      if (valueDataset.issues) {
        _addPathIssues(
          dataset,
          {
            type: 'object',
            origin: 'value',
            input: object,
            key,
            value,
          },
          valueDataset.issues
        );

        // If necessary, abort early
        if (config.abortEarly) {
          dataset.typed = false;
          return true;
        }
      }

      // If not typed, set typed to `false`
      if (!valueDataset.typed) {
        dataset.typed = false;
      }

      // Add entry to dataset
      (dataset.value as Record<string, unknown>)[key] = valueDataset.value;

      // If key is missing but has a fallback, use it
    } else if (
      'fallback' in valueSchema &&
      valueSchema.fallback !== undefined
    ) {
      (dataset.value as Record<string, unknown>)[key] =
        await getFallback(valueSchema);

      // Otherwise, add issue if entry is required
    } else if (!_isOptionalEntry(valueSchema)) {
      _addIssue(context, 'key', dataset, config, {
        input: undefined,
        expected: `"${key}"`,
        path: [
          {
            type: 'object',
            origin: 'key',
            input: object,
            key,
            value,
          },
        ],
      });

      // If necessary, abort early
      if (config.abortEarly) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Parses declared object entries asynchronously.
 *
 * @param context The object entries context.
 * @param dataset The parent dataset.
 * @param config The configuration.
 * @param input The input object.
 *
 * @returns Whether parsing aborted early.
 *
 * @internal
 */
export async function _parseObjectEntriesAsync(
  context: ObjectEntriesContextAsync<ObjectEntriesAsync>,
  dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>,
  config: Config<BaseIssue<unknown>>,
  input: object
): Promise<boolean> {
  return _applyObjectEntriesAsync(
    context,
    dataset,
    config,
    input,
    await _collectObjectEntriesAsync(context, config, input)
  );
}
