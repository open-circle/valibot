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
  OutputDataset,
} from '../../types/index.ts';
import {
  _applyObjectEntriesAsync,
  _collectObjectEntriesAsync,
} from '../../utils/_parseObjectEntries/index.ts';
import {
  _addIssue,
  _addPathIssues,
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
        // Parse each normal and rest entry
        const [normalDatasets, restDatasets] = await Promise.all([
          // Collect declared entry datasets asynchronously
          _collectObjectEntriesAsync(this, config, input),

          // Parse other entries with rest schema asynchronously
          // Hint: We exclude specific keys for security reasons
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

        await _applyObjectEntriesAsync(
          this,
          dataset,
          config,
          input,
          normalDatasets
        );

        // Process each rest entry of schema if necessary
        if (!dataset.issues || !config.abortEarly) {
          const object = input as Record<string, unknown>;
          const output = dataset.value as Record<string, unknown>;
          for (const [key, value, valueDataset] of restDatasets) {
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
                break;
              }
            }

            // If not typed, set typed to `false`
            if (!valueDataset.typed) {
              dataset.typed = false;
            }

            // Add entry to dataset
            output[key] = valueDataset.value;
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
