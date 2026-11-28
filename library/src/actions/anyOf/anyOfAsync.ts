import type {
  BaseIssue,
  BaseValidationAsync,
  ErrorMessage,
  MaybeReadonly,
  OutputDataset,
} from '../../types/index.ts';
import type {
  AnyOfIssue,
  AnyOfOptionAsync,
  AnyOfOptionsConstraint,
  InferAnyOfInput,
  InferAnyOfIssue,
  InferAnyOfOptionOutput,
  ValidAnyOfOptions,
} from './types.ts';
import { _finishAnyOfFailure, _getAnyOfExpects } from './utils/index.ts';

/**
 * Any of options async type.
 */
export type AnyOfOptionsAsync = MaybeReadonly<
  [AnyOfOptionAsync, AnyOfOptionAsync, ...AnyOfOptionAsync[]]
>;

/**
 * Any of action async interface.
 */
export interface AnyOfActionAsync<
  TOptions extends AnyOfOptionsConstraint,
  TMessage extends
    | ErrorMessage<AnyOfIssue<InferAnyOfIssue<TOptions>>>
    | undefined,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
> extends BaseValidationAsync<
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
  readonly reference: typeof anyOfAsync;
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
 * Creates an asynchronous any of validation action.
 *
 * Awaits each option in order and returns the first successful output.
 * If all alternatives fail, their issues become subissues of one any of issue.
 *
 * @param options The any of options.
 *
 * @returns An any of action.
 */
export function anyOfAsync<
  const TOptions extends AnyOfOptionsConstraint,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
>(
  options: TOptions & ValidAnyOfOptions<TOptions, AnyOfOptionAsync>
): AnyOfActionAsync<TOptions, undefined, TInput>;

/**
 * Creates an asynchronous any of validation action.
 *
 * @param options The any of options.
 * @param message The error message.
 *
 * @returns An any of action.
 */
export function anyOfAsync<
  const TOptions extends AnyOfOptionsConstraint,
  const TMessage extends
    | ErrorMessage<AnyOfIssue<InferAnyOfIssue<TOptions>>>
    | undefined,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
>(
  options: TOptions & ValidAnyOfOptions<TOptions, AnyOfOptionAsync>,
  message: TMessage
): AnyOfActionAsync<TOptions, TMessage, TInput>;

// @__NO_SIDE_EFFECTS__
export function anyOfAsync(
  options: AnyOfOptionsAsync,
  message?: ErrorMessage<AnyOfIssue<BaseIssue<unknown>>>
): AnyOfActionAsync<
  AnyOfOptionsAsync,
  ErrorMessage<AnyOfIssue<BaseIssue<unknown>>> | undefined
> {
  return {
    kind: 'validation',
    type: 'any_of',
    reference: anyOfAsync,
    expects: _getAnyOfExpects(options, true),
    async: true,
    options,
    message,
    async '~run'(dataset, config) {
      if (!dataset.typed) {
        return dataset;
      }

      const input = dataset.value;
      let datasets: OutputDataset<unknown, BaseIssue<unknown>>[] | undefined;

      for (const option of options) {
        const optionDataset = await option['~run'](
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
