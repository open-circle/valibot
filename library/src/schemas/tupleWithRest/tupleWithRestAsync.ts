import type {
  ArrayPathItem,
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  InferTupleInput,
  InferTupleIssue,
  InferTupleOutput,
  OutputDataset,
  TupleItemsAsync,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { tupleWithRest } from './tupleWithRest.ts';
import type { TupleWithRestIssue } from './types.ts';

/**
 * Tuple with rest schema async interface.
 */
export interface TupleWithRestSchemaAsync<
  TItems extends TupleItemsAsync,
  TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<TupleWithRestIssue> | undefined,
> extends BaseSchemaAsync<
    [...InferTupleInput<TItems>, ...InferInput<TRest>[]],
    [...InferTupleOutput<TItems>, ...InferOutput<TRest>[]],
    TupleWithRestIssue | InferTupleIssue<TItems> | InferIssue<TRest>
  > {
  /**
   * The schema type.
   */
  readonly type: 'tuple_with_rest';
  /**
   * The schema reference.
   */
  readonly reference: typeof tupleWithRest | typeof tupleWithRestAsync;
  /**
   * The expected property.
   */
  readonly expects: 'Array';
  /**
   * The items schema.
   */
  readonly items: TItems;
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
 * Creates a tuple with rest schema.
 *
 * @param items The items schema.
 * @param rest The rest schema.
 *
 * @returns A tuple with rest schema.
 */
export function tupleWithRestAsync<
  const TItems extends TupleItemsAsync,
  const TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
  items: TItems,
  rest: TRest
): TupleWithRestSchemaAsync<TItems, TRest, undefined>;

/**
 * Creates a tuple with rest schema.
 *
 * @param items The items schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns A tuple with rest schema.
 */
export function tupleWithRestAsync<
  const TItems extends TupleItemsAsync,
  const TRest extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<TupleWithRestIssue> | undefined,
>(
  items: TItems,
  rest: TRest,
  message: TMessage
): TupleWithRestSchemaAsync<TItems, TRest, TMessage>;

// @__NO_SIDE_EFFECTS__
export function tupleWithRestAsync(
  items: TupleItemsAsync,
  rest:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<TupleWithRestIssue>
): TupleWithRestSchemaAsync<
  TupleItemsAsync,
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<TupleWithRestIssue> | undefined
> {
  return _standardSchema<
    TupleWithRestSchemaAsync<
      TupleItemsAsync,
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<TupleWithRestIssue> | undefined
    >
  >({
    kind: 'schema',
    type: 'tuple_with_rest',
    reference: tupleWithRestAsync,
    expects: 'Array',
    async: true,
    items,
    rest,
    message,
    async '~run'(
      this: TupleWithRestSchemaAsync<
        TupleItemsAsync,
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<TupleWithRestIssue> | undefined
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

        // Parse each normal and rest item
        const [normalDatasets, restDatasets] = await Promise.all([
          // Parse schema of each normal item
          Promise.all(
            this.items.map(async (item, key) => {
              const value = input[key];
              return [
                key,
                value,
                await item['~run']({ value }, config),
              ] as const;
            })
          ),

          // Parse other items with rest schema
          Promise.all(
            input.slice(this.items.length).map(async (value, key) => {
              return [
                key + this.items.length,
                value,
                await this.rest['~run']({ value }, config),
              ] as const;
            })
          ),
        ]);

        // Process each tuple item dataset
        for (const [key, value, itemDataset] of normalDatasets) {
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

        // Parse rest with schema if necessary
        if (!dataset.issues || !config.abortEarly) {
          for (const [key, value, itemDataset] of restDatasets) {
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
        }

        // Otherwise, add tuple issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        unknown[],
        TupleWithRestIssue | BaseIssue<unknown>
      >;
    },
  });
}
