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
        _parseObjectEntries(this, dataset, config, input);

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
