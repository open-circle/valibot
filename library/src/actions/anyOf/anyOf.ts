import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
  MaybeReadonly,
  OutputDataset,
} from '../../types/index.ts';
import type {
  AnyOfIssue,
  AnyOfOption,
  AnyOfOptionsConstraint,
  InferAnyOfInput,
  InferAnyOfIssue,
  InferAnyOfOptionOutput,
  ValidAnyOfOptions,
} from './types.ts';
import { _finishAnyOfFailure, _getAnyOfExpects } from './utils/index.ts';

export type { AnyOfIssue } from './types.ts';

/**
 * Any of options type.
 */
export type AnyOfOptions = MaybeReadonly<
  [AnyOfOption, AnyOfOption, ...AnyOfOption[]]
>;

/**
 * Any of action interface.
 */
export interface AnyOfAction<
  TOptions extends AnyOfOptionsConstraint,
  TMessage extends
    | ErrorMessage<AnyOfIssue<InferAnyOfIssue<TOptions>>>
    | undefined,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
> extends BaseValidation<
    TInput,
    InferAnyOfOptionOutput<TOptions[number], TInput>,
    AnyOfIssue<InferAnyOfIssue<TOptions>> | InferAnyOfIssue<TOptions>
  > {
  /**
   * The action type.
   */
  readonly type: 'any_of';
  /**
   * The action reference.
   */
  readonly reference: typeof anyOf;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The any of options.
   */
  readonly options: TOptions;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an any of validation action.
 *
 * The options (sync validations, guards, or transformations) are tried in
 * order and the first one that succeeds decides the result, returning its
 * output. Guards and other conditional transformations (e.g. `toNumber`) can
 * still fail and contribute their issues like validations do — only
 * transformations that always succeed (e.g. `trim`) are guaranteed to
 * short-circuit the rest, so place those last. If every option fails, the
 * option issues are collected as subissues of a single any of issue.
 *
 * @param options The any of options.
 *
 * @returns An any of action.
 */
export function anyOf<
  const TOptions extends AnyOfOptionsConstraint,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
>(
  options: TOptions & ValidAnyOfOptions<TOptions, AnyOfOption>
): AnyOfAction<TOptions, undefined, TInput>;

/**
 * Creates an any of validation action.
 *
 * @param options The any of options.
 * @param message The error message.
 *
 * @returns An any of action.
 */
export function anyOf<
  const TOptions extends AnyOfOptionsConstraint,
  const TMessage extends
    | ErrorMessage<AnyOfIssue<InferAnyOfIssue<TOptions>>>
    | undefined,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
>(
  options: TOptions & ValidAnyOfOptions<TOptions, AnyOfOption>,
  message: TMessage
): AnyOfAction<TOptions, TMessage, TInput>;

// @__NO_SIDE_EFFECTS__
export function anyOf(
  options: AnyOfOptions,
  message?: ErrorMessage<AnyOfIssue<BaseIssue<unknown>>>
): AnyOfAction<
  AnyOfOptions,
  ErrorMessage<AnyOfIssue<BaseIssue<unknown>>> | undefined
> {
  return {
    kind: 'validation',
    type: 'any_of',
    reference: anyOf,
    expects: _getAnyOfExpects(options, false),
    async: false,
    options,
    message,
    '~run'(dataset, config) {
      if (!dataset.typed) {
        return dataset;
      }

      const input = dataset.value;
      let datasets: OutputDataset<unknown, BaseIssue<unknown>>[] | undefined;

      for (const option of options) {
        const optionDataset = option['~run'](
          { typed: true, value: input },
          config
        );

        if (optionDataset.typed && !optionDataset.issues) {
          // Copy the matching option's value onto the incoming dataset so
          // value-changing transforms take effect, but keep returning the
          // incoming dataset so issues already present on it (added earlier
          // in the pipe) aren't discarded.
          dataset.value = optionDataset.value;
          return dataset as typeof optionDataset;
        }

        if (optionDataset.issues) {
          (datasets ??= []).push(optionDataset);
        }
      }

      return _finishAnyOfFailure(this, dataset, config, datasets);
    },
  };
}
