import { getDefault, getFallback } from '../../methods/index.ts';
import type {
  BaseSchema,
  ErrorMessage,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  ObjectEntries,
  ObjectPathItem,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { ObjectIssue } from './types.ts';

/**
 * Object schema interface.
 */
export interface ObjectSchema<
  TEntries extends ObjectEntries,
  TMessage extends ErrorMessage<ObjectIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof object;
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
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
export function object<const TEntries extends ObjectEntries>(
  entries: TEntries
): ObjectSchema<TEntries, undefined>;

/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function object<
  const TEntries extends ObjectEntries,
  const TMessage extends ErrorMessage<ObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): ObjectSchema<TEntries, TMessage>;

// @__NO_SIDE_EFFECTS__
export function object(
  entries: ObjectEntries,
  message?: ErrorMessage<ObjectIssue>
): ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'object',
    reference: object,
    expects: 'Object',
    async: false,
    entries,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && typeof input === 'object') {
        // Set typed to `true` and value to blank object
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = {};

        // Process each object entry of schema
        for (const key in this.entries) {
          const valueSchema = this.entries[key];

          // If key is present or its an optional schema with a default value,
          // parse input of key or default value
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
                : getDefault(valueSchema);
            const valueDataset = valueSchema['~run']({ value }, config);

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
            dataset.value[key] = getFallback(valueSchema);

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
                  // @ts-expect-error
                  value: input[key],
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
        InferObjectOutput<ObjectEntries>,
        ObjectIssue | InferObjectIssue<ObjectEntries>
      >;
    },
  };
}
