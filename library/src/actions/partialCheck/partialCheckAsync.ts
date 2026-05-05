import type {
  BaseValidationAsync,
  ErrorMessage,
  MaybePromise,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type {
  DeepPickN,
  PartialCheckIssue,
  PartialInput,
  Paths,
  RequiredPaths,
  ValidPaths,
} from './types.ts';
import { _isPartiallyTyped } from './utils/index.ts';

/**
 * Partial check action async interface.
 */
export interface PartialCheckActionAsync<
  TInput extends PartialInput,
  TPaths extends Paths,
  TSelection extends DeepPickN<TInput, TPaths>,
  TMessage extends ErrorMessage<PartialCheckIssue<TSelection>> | undefined,
> extends BaseValidationAsync<TInput, TInput, PartialCheckIssue<TSelection>> {
  /**
   * The action type.
   */
  readonly type: 'partial_check';
  /**
   * The action reference.
   */
  readonly reference: typeof partialCheckAsync;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The selected paths.
   */
  readonly paths: TPaths;
  /**
   * The validation function.
   */
  readonly requirement: (input: TSelection) => MaybePromise<boolean>;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a partial check validation action.
 *
 * @param paths The selected paths.
 * @param requirement The validation function.
 *
 * @returns A partial check action.
 */
export function partialCheckAsync<
  TInput extends PartialInput,
  const TPaths extends RequiredPaths,
  const TSelection extends DeepPickN<TInput, TPaths>,
>(
  paths: ValidPaths<TInput, TPaths>,
  requirement: (input: TSelection) => MaybePromise<boolean>
): PartialCheckActionAsync<TInput, TPaths, TSelection, undefined>;

/**
 * Creates a partial check validation action.
 *
 * @param paths The selected paths.
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A partial check action.
 */
export function partialCheckAsync<
  TInput extends PartialInput,
  const TPaths extends RequiredPaths,
  const TSelection extends DeepPickN<TInput, TPaths>,
  const TMessage extends
    | ErrorMessage<PartialCheckIssue<TSelection>>
    | undefined,
>(
  paths: ValidPaths<TInput, TPaths>,
  requirement: (input: TSelection) => MaybePromise<boolean>,
  message: TMessage
): PartialCheckActionAsync<TInput, TPaths, TSelection, TMessage>;

// @__NO_SIDE_EFFECTS__
export function partialCheckAsync(
  paths: Paths,
  requirement: (input: PartialInput) => MaybePromise<boolean>,
  message?: ErrorMessage<PartialCheckIssue<PartialInput>>
): PartialCheckActionAsync<
  PartialInput,
  Paths,
  PartialInput,
  ErrorMessage<PartialCheckIssue<PartialInput>> | undefined
> {
  return {
    kind: 'validation',
    type: 'partial_check',
    reference: partialCheckAsync,
    async: true,
    expects: null,
    paths,
    requirement,
    message,
    async '~run'(dataset, config) {
      if (
        (dataset.typed || _isPartiallyTyped(dataset, paths)) &&
        // @ts-expect-error
        !(await this.requirement(dataset.value))
      ) {
        _addIssue(this, 'input', dataset, config);
      }
      return dataset;
    },
  };
}
