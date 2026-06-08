import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferTupleInput,
  InferTupleIssue,
  InferTupleOutput,
  OutputDataset,
  TupleItems,
} from '../../types/index.ts';
import {
  _addIssue,
  _addPathIssues,
  _getStandardProps,
} from '../../utils/index.ts';
import type { LooseTupleIssue } from './types.ts';

/**
 * Loose tuple schema interface.
 */
export interface LooseTupleSchema<
  TItems extends TupleItems,
  TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
> extends BaseSchema<
    [...InferTupleInput<TItems>, ...unknown[]],
    [...InferTupleOutput<TItems>, ...unknown[]],
    LooseTupleIssue | InferTupleIssue<TItems>
  > {
  /**
   * The schema type.
   */
  readonly type: 'loose_tuple';
  /**
   * The schema reference.
   */
  readonly reference: typeof looseTuple;
  /**
   * The expected property.
   */
  readonly expects: 'Array';
  /**
   * The items schema.
   */
  readonly items: TItems;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a loose tuple schema.
 *
 * @param items The items schema.
 *
 * @returns A loose tuple schema.
 */
export function looseTuple<const TItems extends TupleItems>(
  items: TItems
): LooseTupleSchema<TItems, undefined>;

/**
 * Creates a loose tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A loose tuple schema.
 */
export function looseTuple<
  const TItems extends TupleItems,
  const TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
>(items: TItems, message: TMessage): LooseTupleSchema<TItems, TMessage>;

// @__NO_SIDE_EFFECTS__
export function looseTuple(
  items: TupleItems,
  message?: ErrorMessage<LooseTupleIssue>
): LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'loose_tuple',
    reference: looseTuple,
    expects: 'Array',
    async: false,
    items,
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

        // Parse schema of each tuple item
        for (let key = 0; key < this.items.length; key++) {
          const value = input[key];
          const itemDataset = this.items[key]['~run']({ value }, config);

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

        // Add rest to dataset if necessary
        if (!dataset.issues || !config.abortEarly) {
          for (let key = this.items.length; key < input.length; key++) {
            // @ts-expect-error
            dataset.value.push(input[key]);
          }
        }

        // Otherwise, add tuple issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        unknown[],
        LooseTupleIssue | BaseIssue<unknown>
      >;
    },
  };
}
