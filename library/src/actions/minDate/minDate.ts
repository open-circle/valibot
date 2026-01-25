import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Min date issue interface.
 */
export interface MinDateIssue<TInput extends Date, TRequirement extends Date>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'min_date';
  /**
   * The expected property.
   */
  readonly expected: `>=${string}`;
  /**
   * The minimum date.
   */
  readonly requirement: TRequirement;
}

/**
 * Min date action interface.
 */
export interface MinDateAction<
  TInput extends Date,
  TRequirement extends TInput,
  TMessage extends ErrorMessage<MinDateIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MinDateIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'min_date';
  /**
   * The action reference.
   */
  readonly reference: typeof minDate;
  /**
   * The expected property.
   */
  readonly expects: `>=${string}`;
  /**
   * The minimum date.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min date validation action.
 *
 * @param requirement The minimum date.
 *
 * @returns A min date action.
 */
export function minDate<TInput extends Date, const TRequirement extends TInput>(
  requirement: TRequirement
): MinDateAction<TInput, TRequirement, undefined>;

/**
 * Creates a min date validation action.
 *
 * @param requirement The minimum date.
 * @param message The error message.
 *
 * @returns A min date action.
 */
export function minDate<
  TInput extends Date,
  const TRequirement extends TInput,
  const TMessage extends
    | ErrorMessage<MinDateIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinDateAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function minDate(
  requirement: Date,
  message?: ErrorMessage<MinDateIssue<Date, Date>>
): MinDateAction<
  Date,
  Date,
  ErrorMessage<MinDateIssue<Date, Date>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_date',
    reference: minDate,
    async: false,
    expects: `>=${requirement.toJSON()}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value < this.requirement) {
        _addIssue(this, 'date', dataset, config, {
          received: dataset.value.toJSON(),
        });
      }
      return dataset;
    },
  };
}
