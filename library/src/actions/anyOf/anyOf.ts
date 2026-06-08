import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
  GenericTransformation,
  GenericValidation,
  InferInput,
  InferIssue,
  InferOutput,
  IsNever,
  MaybeReadonly,
  OutputDataset,
  UnionToIntersect,
} from '../../types/index.ts';
import { _addIssue, _joinExpects } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

type AnyOfGuardOption = GenericTransformation & { readonly type: 'guard' };

type AnyOfOption = GenericValidation | AnyOfGuardOption;

/**
 * Any of options type.
 */
export type AnyOfOptions = MaybeReadonly<
  [AnyOfOption, AnyOfOption, ...AnyOfOption[]]
>;

/**
 * Loose option tuples preserve inference before `ValidAnyOfOptions` checks them.
 */
type AnyOfOptionsConstraint = MaybeReadonly<[unknown, unknown, ...unknown[]]>;

interface RuntimeAnyOfOption {
  readonly type: string;
  readonly expects?: string | null;
  readonly '~run': GenericValidation<unknown>['~run'];
}

/**
 * Widens literal value requirements to their base `ValueInput` member.
 */
type WidenValueInput<
  TInput extends ValueInput,
  TBaseInput extends ValueInput = ValueInput,
> = TBaseInput extends unknown
  ? TInput extends TBaseInput
    ? TBaseInput
    : never
  : never;

type InferRequirementItem<TRequirement> =
  TRequirement extends readonly (infer TItem)[] ? TItem : TRequirement;

type InferValueRequirementInput<
  TRequirement,
  TInput,
  TValue = InferRequirementItem<TRequirement>,
> = TValue extends ValueInput
  ? TValue extends TInput
    ? WidenValueInput<TValue>
    : TInput
  : TInput;

type InferAnyOfOptionInput<TOption> = TOption extends AnyOfOption
  ? TOption extends {
      readonly requirement: infer TRequirement;
    }
    ? InferValueRequirementInput<TRequirement, InferInput<TOption>>
    : InferInput<TOption>
  : unknown;

type InferAnyOfInput<TOptions extends readonly unknown[]> = UnionToIntersect<
  InferAnyOfOptionInput<TOptions[number]>
>;

type ExtractAnyOfOption<TOptions extends AnyOfOptionsConstraint> = Extract<
  TOptions[number],
  AnyOfOption
>;

type ExtractAnyOfGuard<TOptions extends AnyOfOptionsConstraint> = Extract<
  TOptions[number],
  AnyOfGuardOption
>;

type ExtractAnyOfValidation<TOptions extends AnyOfOptionsConstraint> = Extract<
  TOptions[number],
  GenericValidation
>;

type InferAnyOfOutput<TOptions extends AnyOfOptionsConstraint, TInput> =
  IsNever<ExtractAnyOfOption<TOptions>> extends true
    ? TInput
    : IsNever<ExtractAnyOfValidation<TOptions>> extends true
      ? TInput & InferOutput<ExtractAnyOfGuard<TOptions>>
      : TInput;

type InferAnyOfIssue<TOptions extends AnyOfOptionsConstraint> =
  IsNever<ExtractAnyOfOption<TOptions>> extends true
    ? BaseIssue<unknown>
    : InferIssue<ExtractAnyOfOption<TOptions>>;

type ValidAnyOfOption<TOption> = TOption extends AnyOfOption
  ? IsNever<InferIssue<TOption>> extends true
    ? never
    : TOption extends AnyOfGuardOption
      ? InferOutput<TOption> extends InferInput<TOption>
        ? TOption
        : never
      : TOption
  : never;

type ValidAnyOfOptions<TOptions extends AnyOfOptionsConstraint> =
  IsNever<InferAnyOfInput<TOptions>> extends true
    ? never
    : TOptions extends {
          readonly [TKey in keyof TOptions]: ValidAnyOfOption<TOptions[TKey]>;
        }
      ? unknown
      : never;

/**
 * Any of issue interface.
 */
export interface AnyOfIssue<TSubIssue extends BaseIssue<unknown>>
  extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'any_of';
  /**
   * The expected property.
   */
  readonly expected: string;
  /**
   * The subissues.
   */
  readonly issues: [TSubIssue, ...TSubIssue[]];
}

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
    InferAnyOfOutput<TOptions, TInput>,
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
 * @param options The any of options.
 *
 * @returns An any of action.
 */
export function anyOf<
  const TOptions extends AnyOfOptionsConstraint,
  TInput extends InferAnyOfInput<TOptions> = InferAnyOfInput<TOptions>,
>(
  options: TOptions & ValidAnyOfOptions<TOptions>
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
  options: TOptions & ValidAnyOfOptions<TOptions>,
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
  if (!Array.isArray(options) || options.length < 2) {
    throw new TypeError(
      'The any of options must contain at least two actions.'
    );
  }

  for (let index = 0; index < options.length; index++) {
    const action = options[index] as {
      readonly async?: unknown;
      readonly kind?: unknown;
      readonly expects?: unknown;
      readonly reference?: unknown;
      readonly type?: unknown;
      readonly '~run'?: unknown;
    } | null;
    const type =
      action && typeof action === 'object' && typeof action.type === 'string'
        ? ` of type "${action.type}"`
        : '';

    if (
      !action ||
      typeof action !== 'object' ||
      action.async !== false ||
      typeof action.type !== 'string' ||
      typeof action.reference !== 'function' ||
      typeof action['~run'] !== 'function' ||
      !(
        (action.kind === 'validation' &&
          (action.expects === null || typeof action.expects === 'string')) ||
        (action.kind === 'transformation' && action.type === 'guard')
      )
    ) {
      throw new TypeError(
        `The any of option at index ${index}${type} must be a sync validation or guard action.`
      );
    }
  }

  const actionOptions = options as readonly RuntimeAnyOfOption[];

  return {
    kind: 'validation',
    type: 'any_of',
    reference: anyOf,
    expects: _joinExpects(
      actionOptions.map((option) =>
        'expects' in option && option.expects ? option.expects : option.type
      ),
      '|'
    ),
    async: false,
    options,
    message,
    '~run'(dataset, config) {
      if (!dataset.typed) {
        return dataset;
      }

      const input = dataset.value;
      let typed = false;
      let issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]] | undefined;

      for (const option of actionOptions) {
        const optionDataset = option['~run'](
          { typed: true, value: input },
          config
        );

        if (optionDataset.typed && !optionDataset.issues) {
          return dataset;
        }

        if (optionDataset.typed) {
          typed = true;
        }

        if (optionDataset.issues) {
          if (issues) {
            issues.push(...optionDataset.issues);
          } else {
            issues = [...optionDataset.issues];
          }
        }
      }

      if (!issues) {
        throw new TypeError(
          'The any of options must return issues when they fail.'
        );
      }

      _addIssue(this, 'input', dataset, config, { issues });

      if (!typed) {
        // @ts-expect-error
        dataset.typed = false;
      }

      return dataset as OutputDataset<
        InferAnyOfOutput<AnyOfOptions, unknown>,
        AnyOfIssue<BaseIssue<unknown>> | BaseIssue<unknown>
      >;
    },
  };
}
