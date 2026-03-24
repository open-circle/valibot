import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  FailureDataset,
  InferInput,
  InferIssue,
  InferOutput,
  MaybeReadonly,
  OutputDataset,
  PartialDataset,
  SuccessDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _joinExpects,
} from '../../utils/index.ts';
import type { UnionIssue } from './types.ts';
import { _subIssues } from './utils/index.ts';

/**
 * Union options type.
 */
export type UnionOptions = MaybeReadonly<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>[]
>;

/**
 * Union schema interface.
 */
export interface UnionSchema<
  TOptions extends UnionOptions,
  TMessage extends
    | ErrorMessage<UnionIssue<InferIssue<TOptions[number]>>>
    | undefined,
> extends BaseSchema<
    InferInput<TOptions[number]>,
    InferOutput<TOptions[number]>,
    UnionIssue<InferIssue<TOptions[number]>> | InferIssue<TOptions[number]>
  > {
  /**
   * The schema type.
   */
  readonly type: 'union';
  /**
   * The schema reference.
   */
  readonly reference: typeof union;
  /**
   * The union options.
   */
  readonly options: TOptions;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

// Cache the last-successful option index per union schema instance
const _lastSuccessIndex = new WeakMap<object, number>();

/**
 * Creates an union schema.
 *
 * @param options The union options.
 *
 * @returns An union schema.
 */
export function union<const TOptions extends UnionOptions>(
  options: TOptions
): UnionSchema<TOptions, undefined>;

/**
 * Creates an union schema.
 *
 * @param options The union options.
 * @param message The error message.
 *
 * @returns An union schema.
 */
export function union<
  const TOptions extends UnionOptions,
  const TMessage extends
    | ErrorMessage<UnionIssue<InferIssue<TOptions[number]>>>
    | undefined,
>(options: TOptions, message: TMessage): UnionSchema<TOptions, TMessage>;

// @__NO_SIDE_EFFECTS__
export function union(
  options: UnionOptions,
  message?: ErrorMessage<UnionIssue<BaseIssue<unknown>>>
): UnionSchema<
  UnionOptions,
  ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined
> {
  return {
    kind: 'schema',
    type: 'union',
    reference: union,
    expects: _joinExpects(
      options.map((option) => option.expects),
      '|'
    ),
    async: false,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Create variables to collect datasets
      let validDataset: SuccessDataset<unknown> | undefined;
      let typedDatasets:
        | PartialDataset<unknown, BaseIssue<unknown>>[]
        | undefined;
      let untypedDatasets: FailureDataset<BaseIssue<unknown>>[] | undefined;

      // Fast path: if the first option succeeded last time, try it first.
      // Restricted to index 0 to preserve left-to-right priority semantics and
      // avoid running side-effecting branches (transforms) out of order.
      if (_lastSuccessIndex.get(this) === 0) {
        const fastDataset = this.options[0]['~run'](
          { value: dataset.value },
          config
        );
        if (fastDataset.typed && !fastDataset.issues) {
          return fastDataset as SuccessDataset<unknown>;
        }
      }

      // Parse schema of each option and collect datasets
      for (let i = 0; i < this.options.length; i++) {
        const optionDataset = this.options[i]['~run'](
          { value: dataset.value },
          config
        );

        // If typed, add it to valid or typed datasets
        if (optionDataset.typed) {
          // If there are issues, add it to typed datasets
          if (optionDataset.issues) {
            if (typedDatasets) {
              typedDatasets.push(optionDataset);
            } else {
              typedDatasets = [optionDataset];
            }

            // Otherwise, record it as valid dataset and break loop
          } else {
            _lastSuccessIndex.set(this, i);
            validDataset = optionDataset;
            break;
          }

          // Otherwise, add it to untyped datasets
        } else {
          if (untypedDatasets) {
            untypedDatasets.push(optionDataset);
          } else {
            untypedDatasets = [optionDataset];
          }
        }
      }

      // If there is a valid dataset, return it
      if (validDataset) {
        return validDataset;
      }

      // If there are typed datasets process only those
      if (typedDatasets) {
        // If there is only one typed dataset, return it
        if (typedDatasets.length === 1) {
          return typedDatasets[0];
        }

        // Otherwise, add issue with typed subissues
        // Hint: If there is more than one typed dataset, we use a general
        // union issue with subissues because the issues could contradict
        // each other.
        _addIssue(this, 'type', dataset, config, {
          issues: _subIssues(typedDatasets),
        });

        // And set typed to `true`
        // @ts-expect-error
        dataset.typed = true;

        // Otherwise, if there is exactly one untyped dataset, return it
      } else if (untypedDatasets?.length === 1) {
        return untypedDatasets[0];

        // Otherwise, add issue with untyped subissues
      } else {
        // Hint: If there are zero or more than one untyped results, we use a
        // general union issue with subissues because the issues could
        // contradict each other.
        _addIssue(this, 'type', dataset, config, {
          issues: _subIssues(untypedDatasets),
        });
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
  };
}
