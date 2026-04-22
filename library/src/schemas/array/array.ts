import type {
  ArrayPathItem,
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
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
  // Pre-bind item's ~run once to avoid per-call property lookups and keep the
  // call site in ~run monomorphic (always the same function reference).
  const _itemRun = item['~run'].bind(item) as typeof item['~run'];

  // Pre-allocate the entry dataset frame; safe because parsing is synchronous.
  const _entryDataset: UnknownDataset = {
    value: undefined,
    typed: false,
    issues: undefined,
  };

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
        // Set typed to `true` and value to pre-sized output array
        // @ts-expect-error
        dataset.typed = true;
        // Pre-size the output array to avoid re-allocations during push.
        const output: unknown[] = new Array(input.length);
        dataset.value = output;

        // Parse schema of each array item. Track `key` outside the loop so
        // we can truncate the output array if we abort early.
        let key = 0;
        for (; key < input.length; key++) {
          const value = input[key];

          _entryDataset.value = value;
          _entryDataset.typed = false;
          _entryDataset.issues = undefined;

          const itemDataset = _itemRun(_entryDataset, config);

          // If there are issues, capture them
          if (itemDataset.issues) {
            // Create array path item
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
          output[key] = itemDataset.value;
        }

        // If we aborted early, trim the pre-sized output array to the number
        // of elements that were actually processed and assigned.
        if (key < input.length) {
          output.length = key;
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
