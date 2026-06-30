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
        await _parseObjectEntriesAsync(this, dataset, config, input);

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
