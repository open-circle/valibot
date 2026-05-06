import { getDefault, getFallback } from '../../methods/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  InferOutput,
  ObjectEntriesAsync,
  ObjectPathItem,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _isValidObjectKey,
} from '../../utils/index.ts';
import type { objectWithRest } from './objectWithRest.ts';
import type { ObjectWithRestIssue } from './types.ts';

/**
 * Object schema async interface.
 */
export interface ObjectWithRestSchemaAsync<
  TEntries extends ObjectEntriesAsync,
  TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
> extends BaseSchemaAsync<
    InferObjectInput<TEntries> & { [key: string]: InferInput<TRest> },
    InferObjectOutput<TEntries> & { [key: string]: InferOutput<TRest> },
    ObjectWithRestIssue | InferObjectIssue<TEntries> | InferIssue<TRest>
  > {
  /**
   * The schema type.
   */
  readonly type: 'object_with_rest';
  /**
   * The schema reference.
   */
  readonly reference: typeof objectWithRest | typeof objectWithRestAsync;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The entries schema.
   */
  readonly entries: TEntries;
  /**
   * The rest schema.
   */
  readonly rest: TRest;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an object with rest schema.
 *
 * @param entries The entries schema.
 * @param rest The rest schema.
 *
 * @returns An object with rest schema.
 */
export function objectWithRestAsync<
  const TEntries extends ObjectEntriesAsync,
  const TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  entries: TEntries,
  rest: TRest
): ObjectWithRestSchemaAsync<TEntries, TRest, undefined>;

/**
 * Creates an object with rest schema.
 *
 * @param entries The entries schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns An object with rest schema.
 */
export function objectWithRestAsync<
  const TEntries extends ObjectEntriesAsync,
  const TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
>(
  entries: TEntries,
  rest: TRest,
  message: TMessage
): ObjectWithRestSchemaAsync<TEntries, TRest, TMessage>;

// @__NO_SIDE_EFFECTS__
export function objectWithRestAsync(
  entries: ObjectEntriesAsync,
  rest:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<ObjectWithRestIssue>
): ObjectWithRestSchemaAsync<
  ObjectEntriesAsync,
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<ObjectWithRestIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'object_with_rest',
    reference: objectWithRestAsync,
    expects: 'Object',
    async: true,
    entries,
    rest,
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

        const parseEntry = async ([key, valueSchema]: [
          string,
          (typeof this.entries)[string],
        ]) => {
          // If key is present or its an optional schema with a default value,
          // parse input of key or default value asynchronously
          if (
            key in input ||
            ((valueSchema.type === 'exact_optional' ||
              valueSchema.type === 'optional' ||
              valueSchema.type === 'nullish') &&
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
        };
        const processEntry = async ([
          key,
          value,
          valueSchema,
          valueDataset,
        ]: Awaited<ReturnType<typeof parseEntry>>) => {
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
                return true;
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
            valueSchema.type !== 'nullish'
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
              return true;
            }
          }
          return false;
        };
        const processRestEntry = ([key, value, valueDataset]: readonly [
          string,
          unknown,
          OutputDataset<unknown, BaseIssue<unknown>>,
        ]) => {
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
              return true;
            }
          }

          // If not typed, set typed to `false`
          if (!valueDataset.typed) {
            dataset.typed = false;
          }

          // Add entry to dataset
          // @ts-expect-error
          dataset.value[key] = valueDataset.value;
          return false;
        };

        // Use sequential parsing if we need to abort before starting the next
        // asynchronous validator.
        if (config.abortEarly) {
          for (const entry of Object.entries(this.entries)) {
            if (await processEntry(await parseEntry(entry))) {
              break;
            }
          }

          // Process each rest entry of schema if necessary
          if (!dataset.issues) {
            for (const [key, value] of Object.entries(input)) {
              if (_isValidObjectKey(input, key) && !(key in this.entries)) {
                if (
                  processRestEntry([
                    key,
                    value,
                    await this.rest['~run']({ value }, config),
                  ])
                ) {
                  break;
                }
              }
            }
          }
        } else {
          // Parse each normal and rest entry in parallel.
          const [normalDatasets, restDatasets] = await Promise.all([
            Promise.all(Object.entries(this.entries).map(parseEntry)),
            Promise.all(
              Object.entries(input)
                .filter(
                  ([key]) =>
                    _isValidObjectKey(input, key) && !(key in this.entries)
                )
                .map(
                  async ([key, value]) =>
                    [
                      key,
                      value,
                      await this.rest['~run']({ value }, config),
                    ] as const
                )
            ),
          ]);

          for (const valueDataset of normalDatasets) {
            await processEntry(valueDataset);
          }

          // Process each rest entry of schema
          for (const restDataset of restDatasets) {
            processRestEntry(restDataset);
          }
        }

        // Otherwise, add object issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        InferObjectOutput<ObjectEntriesAsync> & { [key: string]: unknown },
        | ObjectWithRestIssue
        | InferObjectIssue<ObjectEntriesAsync>
        | BaseIssue<unknown>
      >;
    },
  };
}
