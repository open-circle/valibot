import type {
  BaseIssue,
  BaseSchemaAsync,
  ErrorMessage,
  InferIssue,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _joinExpects,
} from '../../utils/index.ts';
import type { intersect } from './intersect.ts';
import type {
  InferIntersectInput,
  InferIntersectOutput,
  IntersectIssue,
  IntersectOptionsAsync,
} from './types.ts';
import { _merge } from './utils/index.ts';

/**
 * Intersect schema async interface.
 */
export interface IntersectSchemaAsync<
  TOptions extends IntersectOptionsAsync,
  TMessage extends ErrorMessage<IntersectIssue> | undefined,
> extends BaseSchemaAsync<
    InferIntersectInput<TOptions>,
    InferIntersectOutput<TOptions>,
    IntersectIssue | InferIssue<TOptions[number]>
  > {
  /**
   * The schema type.
   */
  readonly type: 'intersect';
  /**
   * The schema reference.
   */
  readonly reference: typeof intersect | typeof intersectAsync;
  /**
   * The intersect options.
   */
  readonly options: TOptions;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an intersect schema.
 *
 * @param options The intersect options.
 *
 * @returns An intersect schema.
 */
export function intersectAsync<const TOptions extends IntersectOptionsAsync>(
  options: TOptions
): IntersectSchemaAsync<TOptions, undefined>;

/**
 * Creates an intersect schema.
 *
 * @param options The intersect options.
 * @param message The error message.
 *
 * @returns An intersect schema.
 */
export function intersectAsync<
  const TOptions extends IntersectOptionsAsync,
  const TMessage extends ErrorMessage<IntersectIssue> | undefined,
>(
  options: TOptions,
  message: TMessage
): IntersectSchemaAsync<TOptions, TMessage>;

// @__NO_SIDE_EFFECTS__
export function intersectAsync(
  options: IntersectOptionsAsync,
  message?: ErrorMessage<IntersectIssue>
): IntersectSchemaAsync<
  IntersectOptionsAsync,
  ErrorMessage<IntersectIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'intersect',
    reference: intersectAsync,
    expects: _joinExpects(
      options.map((option) => option.expects),
      '&'
    ),
    async: true,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      // Parse input with schema of options, if not empty
      if (this.options.length) {
        // Get input value from dataset
        const input = dataset.value;

        // Create variable to store outputs
        let outputs: unknown[] | undefined;

        // Set typed initially to `true`
        // @ts-expect-error
        dataset.typed = true;

        // Parse schema of each option async
        const optionDatasets = await Promise.all(
          this.options.map((schema) => schema['~run']({ value: input }, config))
        );

        // Collect outputs of option datasets
        for (const optionDataset of optionDatasets) {
          // If there are issues, capture them
          if (optionDataset.issues) {
            if (dataset.issues) {
              for (const issue of optionDataset.issues) {
                // @ts-expect-error
                dataset.issues.push(issue);
              }
            } else {
              // @ts-expect-error
              dataset.issues = optionDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If not typed, set typed to `false`
          if (!optionDataset.typed) {
            dataset.typed = false;
          }

          // Add output of option if necessary
          if (dataset.typed) {
            if (outputs) {
              outputs.push(optionDataset.value);
            } else {
              outputs = [optionDataset.value];
            }
          }
        }

        // If outputs are typed, merge them
        if (dataset.typed) {
          // Set first output as initial output
          dataset.value = outputs![0];

          // Merge outputs into one final output
          for (let index = 1; index < outputs!.length; index++) {
            const mergeDataset = _merge(dataset.value, outputs![index]);

            // If outputs can't be merged, add issue and break loop
            if (mergeDataset.issue) {
              _addIssue(this, 'type', dataset, config, {
                received: 'unknown',
              });
              break;
            }

            // Otherwise, set merged output
            dataset.value = mergeDataset.value;
          }
        }

        // Otherwise, add intersect issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        never,
        IntersectIssue | BaseIssue<unknown>
      >;
    },
  };
}
