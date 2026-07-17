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
import { _addIssue, _joinExpects, _subIssues } from '../../utils/index.ts';

type AnyOfOption = GenericValidation | GenericTransformation;

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
 * Infers the input type shared by all options.
 *
 * All options receive the same value, so the input must satisfy every option,
 * i.e. the intersection of their inputs. Each option input is boxed in
 * `{ input: ... }` *before* `UnionToIntersect` so that a union-typed input like
 * `ValueInput` (`string | number | ...`) is intersected as a whole rather than
 * distributed member-by-member — the latter would collapse it to `never`.
 * Genuinely incompatible inputs (e.g. `string` vs `number`) still resolve to
 * `never`, which the pipe rejects.
 */
type InferAnyOfOptionInput<TOption> = TOption extends AnyOfOption
  ? { input: InferInput<TOption> }
  : { input: unknown };

type InferAnyOfInput<TOptions extends readonly unknown[]> =
  UnionToIntersect<InferAnyOfOptionInput<TOptions[number]>> extends {
    input: infer TInput;
  }
    ? TInput
    : never;

type ExtractAnyOfOption<TOptions extends AnyOfOptionsConstraint> = Extract<
  TOptions[number],
  AnyOfOption
>;

/**
 * Infers the output type, which is the union of every option's output because
 * the first option that succeeds decides the result. Value-preserving
 * validations contribute the shared (narrowed) input, whereas guards and
 * transforms contribute their own output type.
 */
type InferAnyOfOutput<TOptions extends AnyOfOptionsConstraint, TInput> = {
  readonly [TKey in keyof TOptions]: TOptions[TKey] extends GenericValidation
    ? TInput
    : TOptions[TKey] extends AnyOfOption
      ? InferOutput<TOptions[TKey]>
      : never;
}[number];

type InferAnyOfIssue<TOptions extends AnyOfOptionsConstraint> =
  IsNever<ExtractAnyOfOption<TOptions>> extends true
    ? BaseIssue<unknown>
    : InferIssue<ExtractAnyOfOption<TOptions>>;

type ValidAnyOfOptions<TOptions extends AnyOfOptionsConstraint> =
  IsNever<InferAnyOfInput<TOptions>> extends true
    ? never
    : TOptions extends {
          readonly [TKey in keyof TOptions]: TOptions[TKey] extends AnyOfOption
            ? TOptions[TKey]
            : never;
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
 * The options (sync validations, guards, or transformations) are tried in
 * order and the first one that succeeds decides the result, returning its
 * output. Since a transformation always succeeds, place transformations last
 * so earlier validations and guards act as gates — an always-succeeding option
 * short-circuits the rest. If every option fails, the option issues are
 * collected as subissues of a single any of issue.
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
        action.kind === 'transformation'
      )
    ) {
      const type =
        typeof action?.type === 'string' ? ` of type "${action.type}"` : '';
      throw new TypeError(
        `The any of option at index ${index}${type} must be a sync validation or transformation action.`
      );
    }
  }

  const actionOptions = options as readonly RuntimeAnyOfOption[];

  return {
    kind: 'validation',
    type: 'any_of',
    reference: anyOf,
    expects: _joinExpects(
      actionOptions.map((option) => option.expects || option.type),
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
      let datasets: OutputDataset<unknown, BaseIssue<unknown>>[] | undefined;

      for (const option of actionOptions) {
        const optionDataset = option['~run'](
          { typed: true, value: input },
          config
        );

        if (optionDataset.typed && !optionDataset.issues) {
          // Return the matching option's output so value-changing transforms
          // take effect; validations and guards leave the value unchanged.
          return optionDataset;
        }

        if (optionDataset.typed) {
          typed = true;
        }

        if (optionDataset.issues) {
          if (datasets) {
            datasets.push(optionDataset);
          } else {
            datasets = [optionDataset];
          }
        }
      }

      const issues = _subIssues(datasets);

      if (!issues) {
        throw new TypeError(
          'The any of options must return issues when they fail.'
        );
      }

      _addIssue(this, 'input', dataset, config, { issues });

      // @ts-expect-error
      dataset.typed = typed;

      return dataset as OutputDataset<
        InferAnyOfOutput<AnyOfOptions, unknown>,
        AnyOfIssue<BaseIssue<unknown>> | BaseIssue<unknown>
      >;
    },
  };
}
