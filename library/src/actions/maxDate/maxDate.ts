import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Max date issue interface.
 */
export interface MaxDateIssue<TInput extends Date, TRequirement extends Date>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'max_date';
  /**
   * The expected property.
   */
  readonly expected: `<=${string}`;
  /**
   * The maximum date.
   */
  readonly requirement: TRequirement;
}

/**
 * Max date action interface.
 */
export interface MaxDateAction<
  TInput extends Date,
  TRequirement extends TInput,
  TMessage extends ErrorMessage<MaxDateIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MaxDateIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'max_date';
  /**
   * The action reference.
   */
  readonly reference: typeof maxDate;
  /**
   * The expected property.
   */
  readonly expects: `<=${string}`;
  /**
   * The maximum date.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max date validation action.
 *
 * @param requirement The maximum date.
 *
 * @returns A max date action.
 */
export function maxDate<TInput extends Date, const TRequirement extends TInput>(
  requirement: TRequirement
): MaxDateAction<TInput, TRequirement, undefined>;

/**
 * Creates a max date validation action.
 *
 * @param requirement The maximum date.
 * @param message The error message.
 *
 * @returns A max date action.
 */
export function maxDate<
  TInput extends Date,
  const TRequirement extends TInput,
  const TMessage extends
    | ErrorMessage<MaxDateIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxDateAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxDate(
  requirement: Date,
  message?: ErrorMessage<MaxDateIssue<Date, Date>>
): MaxDateAction<
  Date,
  Date,
  ErrorMessage<MaxDateIssue<Date, Date>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_date',
    reference: maxDate,
    async: false,
    expects: `<=${requirement.toJSON()}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value > this.requirement) {
        _addIssue(this, 'date', dataset, config, {
          received: dataset.value.toJSON(),
        });
      }
      return dataset;
    },
  };
}
