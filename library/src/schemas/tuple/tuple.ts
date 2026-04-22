import type {
  ArrayPathItem,
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferTupleInput,
  InferTupleIssue,
  InferTupleOutput,
  OutputDataset,
  TupleItems,
  UnknownDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { TupleIssue } from './types.ts';

/**
 * Tuple schema interface.
 */
export interface TupleSchema<
  TItems extends TupleItems,
  TMessage extends ErrorMessage<TupleIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof tuple;
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
 * items you specify. To include unknown items, use `looseTuple`. To
 * return an issue for unknown items, use `strictTuple`. To include and
 * validate unknown items, use `tupleWithRest`.
 *
 * @param items The items schema.
 *
 * @returns A tuple schema.
 */
export function tuple<const TItems extends TupleItems>(
  items: TItems
): TupleSchema<TItems, undefined>;

/**
 * Creates a tuple schema.
 *
 * Hint: This schema removes unknown items. The output will only include the
 * items you specify. To include unknown items, use `looseTuple`. To
 * return an issue for unknown items, use `strictTuple`. To include and
 * validate unknown items, use `tupleWithRest`.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A tuple schema.
 */
export function tuple<
  const TItems extends TupleItems,
  const TMessage extends ErrorMessage<TupleIssue> | undefined,
>(items: TItems, message: TMessage): TupleSchema<TItems, TMessage>;

// @__NO_SIDE_EFFECTS__
export function tuple(
  items: TupleItems,
  message?: ErrorMessage<TupleIssue>
): TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> {
  const _itemRuns = items.map((item) => item['~run'].bind(item) as typeof item['~run']);
  const _entryDataset: UnknownDataset = { value: undefined, typed: false, issues: undefined };

  return {
    kind: 'schema',
    type: 'tuple',
    reference: tuple,
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

          _entryDataset.value = value;
          _entryDataset.typed = false;
          _entryDataset.issues = undefined;
          
          const itemDataset = _itemRuns[key](_entryDataset, config);

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
