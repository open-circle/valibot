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
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { StrictObjectIssue } from './types.ts';

/**
 * Strict object schema interface.
 */
export interface StrictObjectSchema<
  TEntries extends ObjectEntries,
  TMessage extends ErrorMessage<StrictObjectIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof strictObject;
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
export function strictObject<const TEntries extends ObjectEntries>(
  entries: TEntries
): StrictObjectSchema<TEntries, undefined>;

/**
 * Creates a strict object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A strict object schema.
 */
export function strictObject<
  const TEntries extends ObjectEntries,
  const TMessage extends ErrorMessage<StrictObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): StrictObjectSchema<TEntries, TMessage>;

// @__NO_SIDE_EFFECTS__
export function strictObject(
  entries: ObjectEntries,
  message?: ErrorMessage<StrictObjectIssue>
): StrictObjectSchema<
  ObjectEntries,
  ErrorMessage<StrictObjectIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'strict_object',
    reference: strictObject,
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

        // Check input for unknown keys if necessary
        if (!dataset.issues || !config.abortEarly) {
          const object = input as Record<string, unknown>;
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
                    value: object[key],
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
        InferObjectOutput<ObjectEntries>,
        StrictObjectIssue | InferObjectIssue<ObjectEntries>
      >;
    },
  };
}
