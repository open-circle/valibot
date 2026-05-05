import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferIssue,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _joinExpects,
} from '../../utils/index.ts';
import type {
  InferIntersectInput,
  InferIntersectOutput,
  IntersectIssue,
  IntersectOptions,
} from './types.ts';
import { _merge } from './utils/index.ts';

/**
 * Intersect schema interface.
 */
export interface IntersectSchema<
  TOptions extends IntersectOptions,
  TMessage extends ErrorMessage<IntersectIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof intersect;
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
export function intersect<const TOptions extends IntersectOptions>(
  options: TOptions
): IntersectSchema<TOptions, undefined>;

/**
 * Creates an intersect schema.
 *
 * @param options The intersect options.
 * @param message The error message.
 *
 * @returns An intersect schema.
 */
export function intersect<
  const TOptions extends IntersectOptions,
  const TMessage extends ErrorMessage<IntersectIssue> | undefined,
>(options: TOptions, message: TMessage): IntersectSchema<TOptions, TMessage>;

// @__NO_SIDE_EFFECTS__
export function intersect(
  options: IntersectOptions,
  message?: ErrorMessage<IntersectIssue>
): IntersectSchema<IntersectOptions, ErrorMessage<IntersectIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'intersect',
    reference: intersect,
    expects: _joinExpects(
      options.map((option) => option.expects),
      '&'
    ),
    async: false,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Parse input with schema of options, if not empty
      if (this.options.length) {
        // Get input value from dataset
        const input = dataset.value;

        // Create variable to store outputs
        let outputs: unknown[] | undefined;

        // Set typed initially to `true`
        // @ts-expect-error
        dataset.typed = true;

        // Parse schema of each option and collect outputs
        for (const schema of this.options) {
          const optionDataset = schema['~run']({ value: input }, config);

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
