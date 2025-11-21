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
import type { strictObject } from './strictObject.ts';
import type { StrictObjectIssue } from './types.ts';

/**
 * Strict object schema async interface.
 */
export interface StrictObjectSchemaAsync<
  TEntries extends ObjectEntriesAsync,
  TMessage extends ErrorMessage<StrictObjectIssue> | undefined,
> extends BaseSchemaAsync<
    InferObjectInput<TEntries>,
    InferObjectOutput<TEntries>,
    StrictObjectIssue | InferObjectIssue<TEntries>
  > {
  /**
   * The schema type.
   */
  readonly type: 'strict_object';
  /**
   * The schema reference.
   */
  readonly reference: typeof strictObject | typeof strictObjectAsync;
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
 * Creates a strict object schema.
 *
 * @param entries The entries schema.
 *
 * @returns A strict object schema.
 */
export function strictObjectAsync<const TEntries extends ObjectEntriesAsync>(
  entries: TEntries
): StrictObjectSchemaAsync<TEntries, undefined>;

/**
 * Creates a strict object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A strict object schema.
 */
export function strictObjectAsync<
  const TEntries extends ObjectEntriesAsync,
  const TMessage extends ErrorMessage<StrictObjectIssue> | undefined,
>(
  entries: TEntries,
  message: TMessage
): StrictObjectSchemaAsync<TEntries, TMessage>;

// @__NO_SIDE_EFFECTS__
export function strictObjectAsync(
  entries: ObjectEntriesAsync,
  message?: ErrorMessage<StrictObjectIssue>
): StrictObjectSchemaAsync<
  ObjectEntriesAsync,
  ErrorMessage<StrictObjectIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'strict_object',
    reference: strictObjectAsync,
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

        // Check input for unknown keys if necessary
        if (!dataset.issues || !config.abortEarly) {
          for (const key in input) {
            if (!(key in this.entries)) {
              _addIssue(this, 'key', dataset, config, {
                input: key,
                expected: 'never',
                path: [
                  {
                    type: 'object',
                    origin: 'key',
                    input: input as Record<string, unknown>,
                    key,
                    // @ts-expect-error
                    value: input[key],
                  },
                ],
              });

              // Hint: We intentionally break the loop after the first unknown
              // entries. Otherwise, attackers could send large objects to
              // exhaust device resources. If you want an issue for every
              // unknown key, use the `objectWithRest` schema with `never` for
              // the `rest` argument.
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
        StrictObjectIssue | InferObjectIssue<ObjectEntriesAsync>
      >;
    },
  };
}
