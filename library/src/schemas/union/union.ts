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
import { _addIssue, _joinExpects, _standardSchema } from '../../utils/index.ts';
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
  return _standardSchema<
    UnionSchema<
      UnionOptions,
      ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined
    >
  >({
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
    '~run'(
      this: UnionSchema<
        UnionOptions,
        ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined
      >,
      dataset,
      config
    ) {
      // Create variables to collect datasets
      let validDataset: SuccessDataset<unknown> | undefined;
      let typedDatasets:
        | PartialDataset<unknown, BaseIssue<unknown>>[]
        | undefined;
      let untypedDatasets: FailureDataset<BaseIssue<unknown>>[] | undefined;

      // Parse schema of each option and collect datasets
      for (const schema of this.options) {
        const optionDataset = schema['~run']({ value: dataset.value }, config);

        // If typed, add it to valid or typed datasets
        if (optionDataset.typed) {
          // If there are issues, add it to typed datasets
          if (optionDataset.issues) {
            if (typedDatasets) {
              typedDatasets.push(optionDataset);
            } else {
              typedDatasets = [optionDataset];
            }

            // Otherwise, add it as valid dataset and break loop
          } else {
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
  });
}
