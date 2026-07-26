import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _stringify } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

/**
 * Less than value issue type.
 */
export interface LtValueIssue<
  TInput extends ValueInput,
  TRequirement extends TInput,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'lt_value';
  /**
   * The expected property.
   */
  readonly expected: `<${string}`;
  /**
   * The less than value.
   */
  readonly requirement: TRequirement;
}

/**
 * Less than value action type.
 */
export interface LtValueAction<
  TInput extends ValueInput,
  TRequirement extends TInput,
  TMessage extends ErrorMessage<LtValueIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, LtValueIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'lt_value';
  /**
   * The action reference.
   */
  readonly reference: typeof ltValue;
  /**
   * The expected property.
   */
  readonly expects: `<${string}`;
  /**
   * The less than value.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a less than value validation action.
 *
 * @param requirement The less than value.
 *
 * @returns A less than value action.
 */
export function ltValue<
  TInput extends ValueInput,
  const TRequirement extends TInput,
>(requirement: TRequirement): LtValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a less than value validation action.
 *
 * @param requirement The less than value.
 * @param message The error message.
 *
 * @returns A less than value action.
 */
export function ltValue<
  TInput extends ValueInput,
  const TRequirement extends TInput,
  const TMessage extends
    | ErrorMessage<LtValueIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): LtValueAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function ltValue(
  requirement: ValueInput,
  message?: ErrorMessage<LtValueIssue<ValueInput, ValueInput>>
): LtValueAction<
  ValueInput,
  ValueInput,
  ErrorMessage<LtValueIssue<ValueInput, ValueInput>> | undefined
> {
  return {
    kind: 'validation',
    type: 'lt_value',
    reference: ltValue,
    async: false,
    expects: `<${
      requirement instanceof Date
        ? requirement.toJSON()
        : _stringify(requirement)
    }`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !(dataset.value < this.requirement)) {
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
