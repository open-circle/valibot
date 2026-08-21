import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _stringify } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

/**
 * Not value issue interface.
 */
export interface NotValueIssue<
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
  readonly type: 'not_value';
  /**
   * The expected property.
   */
  readonly expected: `!${string}`;
  /**
   * The not required value.
   */
  readonly requirement: TRequirement;
}

/**
 * Not value action interface.
 */
export interface NotValueAction<
  TInput extends ValueInput,
  TRequirement extends TInput,
  TMessage extends
    | ErrorMessage<NotValueIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, NotValueIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'not_value';
  /**
   * The action reference.
   */
  readonly reference: typeof notValue;
  /**
   * The expected property.
   */
  readonly expects: `!${string}`;
  /**
   * The not required value.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not value validation action.
 *
 * @param requirement The not required value.
 *
 * @returns A not value action.
 */
export function notValue<
  TInput extends ValueInput,
  const TRequirement extends TInput,
>(requirement: TRequirement): NotValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a not value validation action.
 *
 * @param requirement The not required value.
 * @param message The error message.
 *
 * @returns A not value action.
 */
export function notValue<
  TInput extends ValueInput,
  const TRequirement extends TInput,
  const TMessage extends
    | ErrorMessage<NotValueIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotValueAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notValue(
  requirement: ValueInput,
  message?: ErrorMessage<NotValueIssue<ValueInput, ValueInput>>
): NotValueAction<
  ValueInput,
  ValueInput,
  ErrorMessage<NotValueIssue<ValueInput, ValueInput>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_value',
    reference: notValue,
    async: false,
    expects:
      requirement instanceof Date
        ? `!${requirement.toJSON()}`
        : `!${_stringify(requirement)}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (
        dataset.typed &&
        (Object.is(this.requirement, dataset.value) ||
          (this.requirement <= dataset.value &&
            this.requirement >= dataset.value))
      ) {
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
