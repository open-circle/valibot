import type {
  ArrayPathItem,
  BaseIssue,
  BaseSchemaAsync,
  ErrorMessage,
  InferTupleInput,
  InferTupleIssue,
  InferTupleOutput,
  OutputDataset,
  TupleItemsAsync,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { strictTuple } from './strictTuple.ts';
import type { StrictTupleIssue } from './types.ts';

/**
 * Strict tuple schema async interface.
 */
export interface StrictTupleSchemaAsync<
  TItems extends TupleItemsAsync,
  TMessage extends ErrorMessage<StrictTupleIssue> | undefined,
> extends BaseSchemaAsync<
    InferTupleInput<TItems>,
    InferTupleOutput<TItems>,
    StrictTupleIssue | InferTupleIssue<TItems>
  > {
  /**
   * The schema type.
   */
  readonly type: 'strict_tuple';
  /**
   * The schema reference.
   */
  readonly reference: typeof strictTuple | typeof strictTupleAsync;
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
 * Creates a strict tuple schema.
 *
 * @param items The items schema.
 *
 * @returns A strict tuple schema.
 */
export function strictTupleAsync<const TItems extends TupleItemsAsync>(
  items: TItems
): StrictTupleSchemaAsync<TItems, undefined>;

/**
 * Creates a strict tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A strict tuple schema.
 */
export function strictTupleAsync<
  const TItems extends TupleItemsAsync,
  const TMessage extends ErrorMessage<StrictTupleIssue> | undefined,
>(items: TItems, message: TMessage): StrictTupleSchemaAsync<TItems, TMessage>;

// @__NO_SIDE_EFFECTS__
export function strictTupleAsync(
  items: TupleItemsAsync,
  message?: ErrorMessage<StrictTupleIssue>
): StrictTupleSchemaAsync<
  TupleItemsAsync,
  ErrorMessage<StrictTupleIssue> | undefined
> {
  return _standardSchema<
    StrictTupleSchemaAsync<
      TupleItemsAsync,
      ErrorMessage<StrictTupleIssue> | undefined
    >
  >({
    kind: 'schema',
    type: 'strict_tuple',
    reference: strictTupleAsync,
    expects: 'Array',
    async: true,
    items,
    message,
    async '~run'(
      this: StrictTupleSchemaAsync<
        TupleItemsAsync,
        ErrorMessage<StrictTupleIssue> | undefined
      >,
      dataset,
      config
    ) {
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
            // Create tuple path item
            const pathItem: ArrayPathItem = {
              type: 'array',
              origin: 'value',
              input,
              key,
              value,
            };

            // Add modified item dataset issues to issues
            for (const issue of itemDataset.issues) {
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
              dataset.issues = itemDataset.issues;
            }

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

        // Check input for unknown items if necessary
        if (
          !(dataset.issues && config.abortEarly) &&
          this.items.length < input.length
        ) {
          _addIssue(this, 'type', dataset, config, {
            input: input[this.items.length],
            expected: 'never',
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: this.items.length,
                value: input[this.items.length],
              },
            ],
          });

          // Hint: We intentionally only add one issue for unknown items.
          // Otherwise, attackers could send large arrays to exhaust
          // device resources. If you want an issue for every unknown item,
          // use the `tupleWithRest` schema with `never` for the `rest`
          // argument.
        }

        // Otherwise, add tuple issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        unknown[],
        StrictTupleIssue | BaseIssue<unknown>
      >;
    },
  });
}
