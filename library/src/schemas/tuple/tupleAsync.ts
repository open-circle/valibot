import type {
  BaseIssue,
  BaseSchemaAsync,
  ErrorMessage,
  InferTupleInput,
  InferTupleIssue,
  InferTupleOutput,
  OutputDataset,
  TupleItemsAsync,
} from '../../types/index.ts';
import {
  _addIssue,
  _addPathIssues,
  _getStandardProps,
} from '../../utils/index.ts';
import type { tuple } from './tuple.ts';
import type { TupleIssue } from './types.ts';

/**
 * Tuple schema async interface.
 */
export interface TupleSchemaAsync<
  TItems extends TupleItemsAsync,
  TMessage extends ErrorMessage<TupleIssue> | undefined,
> extends BaseSchemaAsync<
    InferTupleInput<TItems>,
    InferTupleOutput<TItems>,
    TupleIssue | InferTupleIssue<TItems>
  > {
  /**
   * The schema type.
   */
  readonly type: 'tuple';
  /**
   * The schema reference.
   */
  readonly reference: typeof tuple | typeof tupleAsync;
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
 * Creates a tuple schema.
 *
 * Hint: This schema removes unknown items. The output will only include the
 * items you specify. To include unknown items, use `looseTupleAsync`. To
 * return an issue for unknown items, use `strictTupleAsync`. To include and
 * validate unknown items, use `tupleWithRestAsync`.
 *
 * @param items The items schema.
 *
 * @returns A tuple schema.
 */
export function tupleAsync<const TItems extends TupleItemsAsync>(
  items: TItems
): TupleSchemaAsync<TItems, undefined>;

/**
 * Creates a tuple schema.
 *
 * Hint: This schema removes unknown items. The output will only include the
 * items you specify. To include unknown items, use `looseTupleAsync`. To
 * return an issue for unknown items, use `strictTupleAsync`. To include and
 * validate unknown items, use `tupleWithRestAsync`.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A tuple schema.
 */
export function tupleAsync<
  const TItems extends TupleItemsAsync,
  const TMessage extends ErrorMessage<TupleIssue> | undefined,
>(items: TItems, message: TMessage): TupleSchemaAsync<TItems, TMessage>;

// @__NO_SIDE_EFFECTS__
export function tupleAsync(
  items: TupleItemsAsync,
  message?: ErrorMessage<TupleIssue>
): TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'tuple',
    reference: tupleAsync,
    expects: 'Array',
    async: true,
    items,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (Array.isArray(input)) {
        // Set typed to `true` and value to empty array
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = [];

        // Parse schema of each tuple item
        const itemDatasets = await Promise.all(
          this.items.map(async (item, key) => {
            const value = input[key];
            return [key, value, await item['~run']({ value }, config)] as const;
          })
        );

        // Process each tuple item dataset
        for (const [key, value, itemDataset] of itemDatasets) {
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

        // Otherwise, add tuple issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        unknown[],
        TupleIssue | BaseIssue<unknown>
      >;
    },
  };
}
