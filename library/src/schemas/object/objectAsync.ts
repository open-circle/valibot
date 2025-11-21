import { getDefault, getFallback } from '../../methods/index.ts';
import type {
  BaseSchemaAsync,
  ErrorMessage,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  ObjectEntriesAsync,
  ObjectPathItem,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { object } from './object.ts';
import type { ObjectIssue } from './types.ts';

/**
 * Object schema async interface.
 */
export interface ObjectSchemaAsync<
  TEntries extends ObjectEntriesAsync,
  TMessage extends ErrorMessage<ObjectIssue> | undefined,
> extends BaseSchemaAsync<
    InferObjectInput<TEntries>,
    InferObjectOutput<TEntries>,
    ObjectIssue | InferObjectIssue<TEntries>
  > {
  /**
   * The schema type.
   */
  readonly type: 'object';
  /**
   * The schema reference.
   */
  readonly reference: typeof object | typeof objectAsync;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The entries schema.
   */
  readonly entries: TEntries;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObjectAsync`. To
 * return an issue for unknown entries, use `strictObjectAsync`. To include and
 * validate unknown entries, use `objectWithRestAsync`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
export function objectAsync<const TEntries extends ObjectEntriesAsync>(
  entries: TEntries
): ObjectSchemaAsync<TEntries, undefined>;

/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObjectAsync`. To
 * return an issue for unknown entries, use `strictObjectAsync`. To include and
 * validate unknown entries, use `objectWithRestAsync`.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function objectAsync<
  const TEntries extends ObjectEntriesAsync,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): ObjectSchemaAsync<TEntries, TMessage>;

// @__NO_SIDE_EFFECTS__
export function objectAsync(
  entries: ObjectEntriesAsync,
  message?: ErrorMessage<ObjectIssue>
): ObjectSchemaAsync<
  ObjectEntriesAsync,
  ErrorMessage<ObjectIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'object',
    reference: objectAsync,
    expects: 'Object',
    async: true,
    entries,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && typeof input === 'object') {
        // Set typed to `true` and value to blank object
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = {};

        // If key is present or its an optional schema with a default value,
        // parse input of key or default value asynchronously
        const valueDatasets = await Promise.all(
          Object.entries(this.entries).map(async ([key, valueSchema]) => {
            if (
              key in input ||
              ((valueSchema.type === 'exact_optional' ||
                valueSchema.type === 'optional' ||
                valueSchema.type === 'nullish' ||
                valueSchema.type === 'undefinedable') &&
                // @ts-expect-error
                valueSchema.default !== undefined)
            ) {
              const value: unknown =
                key in input
                  ? // @ts-expect-error
                    input[key]
                  : await getDefault(valueSchema);
              return [
                key,
                value,
                valueSchema,
                await valueSchema['~run']({ value }, config),
              ] as const;
            }
            return [
              key,
              // @ts-expect-error
              input[key] as unknown,
              valueSchema,
              null,
            ] as const;
          })
        );

        // Process each object entry of schema
        for (const [key, value, valueSchema, valueDataset] of valueDatasets) {
          // If key is present or its an optional schema with a default value,
          // process its value dataset
          if (valueDataset) {
            // If there are issues, capture them
            if (valueDataset.issues) {
              // Create object path item
              const pathItem: ObjectPathItem = {
                type: 'object',
                origin: 'value',
                input: input as Record<string, unknown>,
                key,
                value,
              };

              // Add modified entry dataset issues to issues
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  // @ts-expect-error
                  issue.path = [pathItem];
                }
                // @ts-expect-error
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                // @ts-expect-error
                dataset.issues = valueDataset.issues;
              }

              // If necessary, abort early
              if (config.abortEarly) {
                dataset.typed = false;
                break;
              }
            }

            // If not typed, set typed to `false`
            if (!valueDataset.typed) {
              dataset.typed = false;
            }

            // Add entry to dataset
            // @ts-expect-error
            dataset.value[key] = valueDataset.value;

            // Otherwise, if key is missing but has a fallback, use it
            // @ts-expect-error
          } else if (valueSchema.fallback !== undefined) {
            // @ts-expect-error
            dataset.value[key] = await getFallback(valueSchema);

            // Otherwise, if key is missing and required, add issue
          } else if (
            valueSchema.type !== 'exact_optional' &&
            valueSchema.type !== 'optional' &&
            valueSchema.type !== 'nullish' &&
            valueSchema.type !== 'undefinedable'
          ) {
            _addIssue(this, 'key', dataset, config, {
              input: undefined,
              expected: `"${key}"`,
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input: input as Record<string, unknown>,
                  key,
                  value,
                },
              ],
            });

            // If necessary, abort early
            if (config.abortEarly) {
              break;
            }
          }
        }

        // Otherwise, add object issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        InferObjectOutput<ObjectEntriesAsync>,
        ObjectIssue | InferObjectIssue<ObjectEntriesAsync>
      >;
    },
  };
}
