import type {
  ArrayPathItem,
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  InferTupleInput,
  InferTupleIssue,
  InferTupleOutput,
  OutputDataset,
  TupleItems,
  UnknownDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { TupleWithRestIssue } from './types.ts';

/**
 * Tuple with rest schema interface.
 */
export interface TupleWithRestSchema<
  TItems extends TupleItems,
  TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<TupleWithRestIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof tupleWithRest;
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
export function tupleWithRest<
  const TItems extends TupleItems,
  const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(items: TItems, rest: TRest): TupleWithRestSchema<TItems, TRest, undefined>;

/**
 * Creates a tuple with rest schema.
 *
 * @param items The items schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns A tuple with rest schema.
 */
export function tupleWithRest<
  const TItems extends TupleItems,
  const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<TupleWithRestIssue> | undefined,
>(
  items: TItems,
  rest: TRest,
  message: TMessage
): TupleWithRestSchema<TItems, TRest, TMessage>;

// @__NO_SIDE_EFFECTS__
export function tupleWithRest(
  items: TupleItems,
  rest: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<TupleWithRestIssue>
): TupleWithRestSchema<
  TupleItems,
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<TupleWithRestIssue> | undefined
> {
  const _itemRuns = items.map((item) => item['~run'].bind(item) as typeof item['~run']);
  const _restRun = rest['~run'].bind(rest) as typeof rest['~run'];
  const _entryDataset: UnknownDataset = { value: undefined, typed: false, issues: undefined };

  return {
    kind: 'schema',
    type: 'tuple_with_rest',
    reference: tupleWithRest,
    expects: 'Array',
    async: false,
    items,
    rest,
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

        // Parse rest with schema if necessary
        if (!dataset.issues || !config.abortEarly) {
          for (let key = this.items.length; key < input.length; key++) {
            const value = input[key];
            
            _entryDataset.value = value;
            _entryDataset.typed = false;
            _entryDataset.issues = undefined;

            const itemDataset = _restRun(_entryDataset, config);

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
  };
}
