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
import type { looseTuple } from './looseTuple.ts';
import type { LooseTupleIssue } from './types.ts';

/**
 * Loose tuple schema async interface.
 */
export interface LooseTupleSchemaAsync<
  TItems extends TupleItemsAsync,
  TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
> extends BaseSchemaAsync<
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
  readonly reference: typeof looseTuple | typeof looseTupleAsync;
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
export function looseTupleAsync<const TItems extends TupleItemsAsync>(
  items: TItems
): LooseTupleSchemaAsync<TItems, undefined>;

/**
 * Creates a loose tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A loose tuple schema.
 */
export function looseTupleAsync<
  const TItems extends TupleItemsAsync,
  const TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
>(items: TItems, message: TMessage): LooseTupleSchemaAsync<TItems, TMessage>;

// @__NO_SIDE_EFFECTS__
export function looseTupleAsync(
  items: TupleItemsAsync,
  message?: ErrorMessage<LooseTupleIssue>
): LooseTupleSchemaAsync<
  TupleItemsAsync,
  ErrorMessage<LooseTupleIssue> | undefined
> {
  return _standardSchema<
    LooseTupleSchemaAsync<
      TupleItemsAsync,
      ErrorMessage<LooseTupleIssue> | undefined
    >
  >({
    kind: 'schema',
    type: 'loose_tuple',
    reference: looseTupleAsync,
    expects: 'Array',
    async: true,
    items,
    message,
    async '~run'(
      this: LooseTupleSchemaAsync<
        TupleItemsAsync,
        ErrorMessage<LooseTupleIssue> | undefined
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
  });
}
