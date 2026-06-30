import type {
  BaseSchemaAsync,
  ErrorMessage,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  ObjectEntriesAsync,
  OutputDataset,
} from '../../types/index.ts';
import { _parseObjectEntriesAsync } from '../../utils/_parseObjectEntries/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _isValidObjectKey,
} from '../../utils/index.ts';
import type { looseObject } from './looseObject.ts';
import type { LooseObjectIssue } from './types.ts';

/**
 * Object schema async interface.
 */
export interface LooseObjectSchemaAsync<
  TEntries extends ObjectEntriesAsync,
  TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
> extends BaseSchemaAsync<
    InferObjectInput<TEntries> & { [key: string]: unknown },
    InferObjectOutput<TEntries> & { [key: string]: unknown },
    LooseObjectIssue | InferObjectIssue<TEntries>
  > {
  /**
   * The schema type.
   */
  readonly type: 'loose_object';
  /**
   * The schema reference.
   */
  readonly reference: typeof looseObject | typeof looseObjectAsync;
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
 * Creates a loose object schema.
 *
 * @param entries The entries schema.
 *
 * @returns A loose object schema.
 */
export function looseObjectAsync<const TEntries extends ObjectEntriesAsync>(
  entries: TEntries
): LooseObjectSchemaAsync<TEntries, undefined>;

/**
 * Creates a loose object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A loose object schema.
 */
export function looseObjectAsync<
  const TEntries extends ObjectEntriesAsync,
  const TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
>(
  entries: TEntries,
  message: TMessage
): LooseObjectSchemaAsync<TEntries, TMessage>;

// @__NO_SIDE_EFFECTS__
export function looseObjectAsync(
  entries: ObjectEntriesAsync,
  message?: ErrorMessage<LooseObjectIssue>
): LooseObjectSchemaAsync<
  ObjectEntriesAsync,
  ErrorMessage<LooseObjectIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'loose_object',
    reference: looseObjectAsync,
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
        await _parseObjectEntriesAsync(this, dataset, config, input);

        // Add rest to dataset if necessary
        // Hint: We exclude specific keys for security reasons
        if (!dataset.issues || !config.abortEarly) {
          const object = input as Record<string, unknown>;
          const output = dataset.value as Record<string, unknown>;
          for (const key in input) {
            if (_isValidObjectKey(input, key) && !(key in this.entries)) {
              output[key] = object[key];
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
        InferObjectOutput<ObjectEntriesAsync> & { [key: string]: unknown },
        LooseObjectIssue | InferObjectIssue<ObjectEntriesAsync>
      >;
    },
  };
}
