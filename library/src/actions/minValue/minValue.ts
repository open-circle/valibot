import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _stringify } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

/**
 * Min value issue interface.
 */
export interface MinValueIssue<
  TInput extends ValueInput,
  TRequirement extends ValueInput,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'min_value';
  /**
   * The expected property.
   */
  readonly expected: `>=${string}`;
  /**
   * The minimum value.
   */
  readonly requirement: TRequirement;
}

/**
 * Min value action interface.
 */
export interface MinValueAction<
  TInput extends ValueInput,
  TRequirement extends TInput,
  TMessage extends
    ErrorMessage<MinValueIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MinValueIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'min_value';
  /**
   * The action reference.
   */
  readonly reference: typeof minValue;
  /**
   * The expected property.
   */
  readonly expects: `>=${string}`;
  /**
   * The minimum value.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min value validation action.
 *
 * @param requirement The minimum value.
 *
 * @returns A min value action.
 */
export function minValue<
  TInput extends ValueInput,
  const TRequirement extends TInput,
>(requirement: TRequirement): MinValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a min value validation action.
 *
 * @param requirement The minimum value.
 * @param message The error message.
 *
 * @returns A min value action.
 */
export function minValue<
  TInput extends ValueInput,
  const TRequirement extends TInput,
  const TMessage extends
    ErrorMessage<MinValueIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinValueAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function minValue(
  requirement: ValueInput,
  message?: ErrorMessage<MinValueIssue<ValueInput, ValueInput>>
): MinValueAction<
  ValueInput,
  ValueInput,
  ErrorMessage<MinValueIssue<ValueInput, ValueInput>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_value',
    reference: minValue,
    async: false,
    expects: `>=${
      requirement instanceof Date
        ? requirement.toJSON()
        : _stringify(requirement)
    }`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !(dataset.value >= this.requirement)) {
        _addIssue(this, 'value', dataset, config, {
          received:
            dataset.value instanceof Date
              ? dataset.value.toJSON()
              : _stringify(dataset.value),
        });
      }
      return dataset;
    },
  };
}
