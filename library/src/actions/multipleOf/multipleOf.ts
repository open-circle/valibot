import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Input type
 */
type Input = number | bigint;

/**
 * Multiple of issue interface.
 */
export interface MultipleOfIssue<
  TInput extends Input,
  TRequirement extends Input,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'multiple_of';
  /**
   * The expected property.
   */
  readonly expected: `%${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${TInput}`;
  /**
   * The divisor.
   */
  readonly requirement: TRequirement;
}

/**
 * Multiple of action interface.
 */
export interface MultipleOfAction<
  TInput extends Input,
  TRequirement extends Input,
  TMessage extends
    | ErrorMessage<MultipleOfIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MultipleOfIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'multiple_of';
  /**
   * The action reference.
   */
  readonly reference: typeof multipleOf;
  /**
   * The expected property.
   */
  readonly expects: `%${TRequirement}`;
  /**
   * The divisor.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [multiple](https://en.wikipedia.org/wiki/Multiple_(mathematics)) of validation action.
 *
 * @param requirement The divisor.
 *
 * @returns A multiple of action.
 */
export function multipleOf<
  TInput extends number,
  const TRequirement extends number,
>(requirement: TRequirement): MultipleOfAction<TInput, TRequirement, undefined>;

/**
 * Creates a [multiple](https://en.wikipedia.org/wiki/Multiple_(mathematics)) of validation action.
 *
 * @param requirement The divisor.
 *
 * @returns A multiple of action.
 */
export function multipleOf<
  TInput extends bigint,
  const TRequirement extends bigint,
>(requirement: TRequirement): MultipleOfAction<TInput, TRequirement, undefined>;

/**
 * Creates a [multiple](https://en.wikipedia.org/wiki/Multiple_(mathematics)) of validation action.
 *
 * @param requirement The divisor.
 * @param message The error message.
 *
 * @returns A multiple of action.
 */
export function multipleOf<
  TInput extends number,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MultipleOfIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MultipleOfAction<TInput, TRequirement, TMessage>;

/**
 * Creates a [multiple](https://en.wikipedia.org/wiki/Multiple_(mathematics)) of validation action.
 *
 * @param requirement The divisor.
 * @param message The error message.
 *
 * @returns A multiple of action.
 */
export function multipleOf<
  TInput extends bigint,
  const TRequirement extends bigint,
  const TMessage extends
    | ErrorMessage<MultipleOfIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MultipleOfAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function multipleOf(
  requirement: Input,
  message?: ErrorMessage<MultipleOfIssue<Input, Input>>
): MultipleOfAction<
  Input,
  Input,
  ErrorMessage<MultipleOfIssue<Input, Input>> | undefined
> {
  return {
    kind: 'validation',
    type: 'multiple_of',
    reference: multipleOf,
    async: false,
    expects: `%${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      // @ts-expect-error
      if (dataset.typed && dataset.value % this.requirement != 0) {
        _addIssue(this, 'multiple', dataset, config);
      }
      return dataset;
    },
  };
}
