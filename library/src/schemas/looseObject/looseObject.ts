import type {
  BaseSchema,
  ErrorMessage,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  ObjectEntries,
  OutputDataset,
} from '../../types/index.ts';
import { _parseObjectEntries } from '../../utils/_parseObjectEntries/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _isValidObjectKey,
} from '../../utils/index.ts';
import type { LooseObjectIssue } from './types.ts';

/**
 * Loose object schema interface.
 */
export interface LooseObjectSchema<
  TEntries extends ObjectEntries,
  TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof looseObject;
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
export function looseObject<const TEntries extends ObjectEntries>(
  entries: TEntries
): LooseObjectSchema<TEntries, undefined>;

/**
 * Creates a loose object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A loose object schema.
 */
export function looseObject<
  const TEntries extends ObjectEntries,
  const TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): LooseObjectSchema<TEntries, TMessage>;

// @__NO_SIDE_EFFECTS__
export function looseObject(
  entries: ObjectEntries,
  message?: ErrorMessage<LooseObjectIssue>
): LooseObjectSchema<
  ObjectEntries,
  ErrorMessage<LooseObjectIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'loose_object',
    reference: looseObject,
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
        _parseObjectEntries(this, dataset, config, input);

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
        InferObjectOutput<ObjectEntries> & { [key: string]: unknown },
        LooseObjectIssue | InferObjectIssue<ObjectEntries>
      >;
    },
  };
}
