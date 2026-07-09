import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _addPathIssues,
  _getStandardProps,
} from '../../utils/index.ts';
import type { ArrayIssue } from './types.ts';

/**
 * Array schema interface.
 */
export interface ArraySchema<
  TItem extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<ArrayIssue> | undefined,
> extends BaseSchema<
    InferInput<TItem>[],
    InferOutput<TItem>[],
    ArrayIssue | InferIssue<TItem>
  > {
  /**
   * The schema type.
   */
  readonly type: 'array';
  /**
   * The schema reference.
   */
  readonly reference: typeof array;
  /**
   * The expected property.
   */
  readonly expects: 'Array';
  /**
   * The array item schema.
   */
  readonly item: TItem;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 *
 * @returns An array schema.
 */
export function array<
  const TItem extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(item: TItem): ArraySchema<TItem, undefined>;

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 * @param message The error message.
 *
 * @returns An array schema.
 */
export function array<
  const TItem extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<ArrayIssue> | undefined,
>(item: TItem, message: TMessage): ArraySchema<TItem, TMessage>;

// @__NO_SIDE_EFFECTS__
export function array(
  item: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<ArrayIssue>
): ArraySchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<ArrayIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'array',
    reference: array,
    expects: 'Array',
    async: false,
    item,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (Array.isArray(input)) {
        // Set typed to `true` and value to empty array
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = [];

        // Parse schema of each array item
        for (let key = 0; key < input.length; key++) {
          const value = input[key];
          const itemDataset = this.item['~run']({ value }, config);

          // If there are issues, capture them
          if (itemDataset.issues) {
            _addPathIssues(
              dataset,
              {
                type: 'array',
                origin: 'value',
                input,
                key,
                value,
              },
              itemDataset.issues
            );

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If not typed, set typed to `false`
          if (!itemDataset.typed) {
            dataset.typed = false;
          }

          // Add item to dataset
          // @ts-expect-error
          dataset.value.push(itemDataset.value);
        }

        // Otherwise, add array issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        unknown[],
        ArrayIssue | BaseIssue<unknown>
      >;
    },
  };
}
