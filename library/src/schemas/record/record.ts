import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferIssue,
  ObjectPathItem,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _isValidObjectKey,
  isPlainObject,
} from '../../utils/index.ts';
import type {
  InferRecordInput,
  InferRecordOutput,
  RecordIssue,
} from './types.ts';

/**
 * Record schema interface.
 */
export interface RecordSchema<
  TKey extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
  TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<RecordIssue> | undefined,
> extends BaseSchema<
    InferRecordInput<TKey, TValue>,
    InferRecordOutput<TKey, TValue>,
    RecordIssue | InferIssue<TKey> | InferIssue<TValue>
  > {
  /**
   * The schema type.
   */
  readonly type: 'record';
  /**
   * The schema reference.
   */
  readonly reference: typeof record;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The record key schema.
   */
  readonly key: TKey;
  /**
   * The record value schema.
   */
  readonly value: TValue;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a record schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 *
 * @returns A record schema.
 */
export function record<
  const TKey extends BaseSchema<
    string,
    string | number | symbol,
    BaseIssue<unknown>
  >,
  const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(key: TKey, value: TValue): RecordSchema<TKey, TValue, undefined>;

/**
 * Creates a record schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A record schema.
 */
export function record<
  const TKey extends BaseSchema<
    string,
    string | number | symbol,
    BaseIssue<unknown>
  >,
  const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<RecordIssue> | undefined,
>(
  key: TKey,
  value: TValue,
  message: TMessage
): RecordSchema<TKey, TValue, TMessage>;

// @__NO_SIDE_EFFECTS__
export function record(
  key: BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
  value: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<RecordIssue>
): RecordSchema<
  BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<RecordIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'record',
    reference: record,
    expects: 'Object',
    async: false,
    key,
    value,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && isPlainObject(input)) {
        // Set typed to `true` and value to empty object
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = {};

        // Parse schema of each record entry
        // Hint: for...in loop always returns keys as strings
        // Hint: We exclude specific keys for security reasons
        for (const entryKey in input) {
          if (_isValidObjectKey(input, entryKey)) {
            // Get value of record entry
            const entryValue: unknown = input[entryKey as keyof typeof input];

            // Get dataset of key schema
            const keyDataset = this.key['~run']({ value: entryKey }, config);

            // If there are issues, capture them
            if (keyDataset.issues) {
              // Create record path item
              const pathItem: ObjectPathItem = {
                type: 'object',
                origin: 'key',
                input: input as Record<string, unknown>,
                key: entryKey,
                value: entryValue,
              };

              // Add modified item dataset issues to issues
              for (const issue of keyDataset.issues) {
                // @ts-expect-error
                issue.path = [pathItem];
                // @ts-expect-error
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                // @ts-expect-error
                dataset.issues = keyDataset.issues;
              }

              // If necessary, abort early
              if (config.abortEarly) {
                dataset.typed = false;
                break;
              }
            }

            // Get dataset of value schema
            const valueDataset = this.value['~run'](
              { value: entryValue },
              config
            );

            // If there are issues, capture them
            if (valueDataset.issues) {
              // Create record path item
              const pathItem: ObjectPathItem = {
                type: 'object',
                origin: 'value',
                input: input as Record<string, unknown>,
                key: entryKey,
                value: entryValue,
              };

              // Add modified item dataset issues to issues
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
            if (!keyDataset.typed || !valueDataset.typed) {
              dataset.typed = false;
            }

            // If key is typed, add entry to dataset
            if (keyDataset.typed) {
              // @ts-expect-error
              dataset.value[keyDataset.value] = valueDataset.value;
            }
          }
        }

        // Otherwise, add record issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        Record<string | number | symbol, unknown>,
        RecordIssue | BaseIssue<unknown>
      >;
    },
  };
}
