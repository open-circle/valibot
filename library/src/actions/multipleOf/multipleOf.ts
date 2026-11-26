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

function decimalParts(value: number): [bigint, number] {
  const [mantissa, exponent = '0'] = value.toString().toLowerCase().split('e');
  const point = mantissa.indexOf('.');
  const fraction = point === -1 ? 0 : mantissa.length - point - 1;
  const negative = mantissa.startsWith('-');
  const digits = mantissa.replace('.', '').replace('-', '');
  return [BigInt((negative ? '-' : '') + digits), Number(exponent) - fraction];
}

function isDecimalMultiple(value: number, requirement: number): boolean {
  if (!Number.isFinite(value) || !Number.isFinite(requirement)) {
    return value % requirement === 0;
  }

  const [valueCoefficient, valueExponent] = decimalParts(value);
  const [requirementCoefficient, requirementExponent] =
    decimalParts(requirement);
  if (requirementCoefficient === 0n) {
    return false;
  }

  const shift = valueExponent - requirementExponent;
  return shift >= 0
    ? (valueCoefficient * 10n ** BigInt(shift)) % requirementCoefficient === 0n
    : valueCoefficient % (requirementCoefficient * 10n ** BigInt(-shift)) ===
        0n;
}

function isMultiple(value: Input, requirement: Input): boolean {
  if (typeof value === 'number' && typeof requirement === 'number') {
    return isDecimalMultiple(value, requirement);
  }
  if (typeof value === 'bigint' && typeof requirement === 'bigint') {
    return value % requirement === 0n;
  }
  // @ts-expect-error
  return value % requirement == 0;
}

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
      if (dataset.typed && !isMultiple(dataset.value, this.requirement)) {
        _addIssue(this, 'multiple', dataset, config);
      }
      return dataset;
    },
  };
}
