import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferObjectInput,
  InferObjectIssue,
  InferObjectOutput,
  InferOutput,
  ObjectEntries,
  OutputDataset,
} from '../../types/index.ts';
import { _parseObjectEntries } from '../../utils/_parseObjectEntries/index.ts';
import {
  _addIssue,
  _addPathIssues,
  _getStandardProps,
  _isValidObjectKey,
} from '../../utils/index.ts';
import type { ObjectWithRestIssue } from './types.ts';

/**
 * Object with rest schema interface.
 */
export interface ObjectWithRestSchema<
  TEntries extends ObjectEntries,
  TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof objectWithRest;
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
export function objectWithRest<
  const TEntries extends ObjectEntries,
  const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  entries: TEntries,
  rest: TRest
): ObjectWithRestSchema<TEntries, TRest, undefined>;

/**
 * Creates an object with rest schema.
 *
 * @param entries The entries schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns An object with rest schema.
 */
export function objectWithRest<
  const TEntries extends ObjectEntries,
  const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
>(
  entries: TEntries,
  rest: TRest,
  message: TMessage
): ObjectWithRestSchema<TEntries, TRest, TMessage>;

// @__NO_SIDE_EFFECTS__
export function objectWithRest(
  entries: ObjectEntries,
  rest: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<ObjectWithRestIssue>
): ObjectWithRestSchema<
  ObjectEntries,
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<ObjectWithRestIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'object_with_rest',
    reference: objectWithRest,
    expects: 'Object',
    async: false,
    entries,
    rest,
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

        // Parse schema of each rest entry if necessary
        // Hint: We exclude specific keys for security reasons
        if (!dataset.issues || !config.abortEarly) {
          const object = input as Record<string, unknown>;
          const output = dataset.value as Record<string, unknown>;
          for (const key in input) {
            if (_isValidObjectKey(input, key) && !(key in this.entries)) {
              const value = object[key];
              const valueDataset = this.rest['~run']({ value }, config);

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
        }

        // Otherwise, add object issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        InferObjectOutput<ObjectEntries> & { [key: string]: unknown },
        | ObjectWithRestIssue
        | InferObjectIssue<ObjectEntries>
        | BaseIssue<unknown>
      >;
    },
  };
}
