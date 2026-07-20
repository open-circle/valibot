import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
  GenericTransformation,
  GenericValidation,
  InferInput,
  InferIssue,
  InferOutput,
  IsAny,
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
 * Shape of an option before it has passed the runtime validation loop below,
 * used only to probe whether it looks like a sync validation or
 * transformation action.
 */
interface UncheckedAnyOfOption {
  readonly async?: unknown;
  readonly kind?: unknown;
  readonly expects?: unknown;
  readonly reference?: unknown;
  readonly type?: unknown;
  readonly '~run'?: unknown;
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
 * Extracts options whose input type could not be resolved.
 *
 * `readonly()`, `brand(...)` and `flavor(...)` take no other argument that
 * ties their input to a concrete type, so calling them bare (e.g.
 * `readonly()`) silently defaults their input to `unknown` instead of
 * inferring it from context, corrupting the output union with a wrong type.
 * Passing an explicit type argument (e.g. `readonly<string>()`) resolves the
 * input normally and is unaffected by this check.
 *
 * The `IsAny` guard rules out `any` first: without it, the structural check of
 * `anyOf`'s own `reference` against `BaseValidation`'s `(...args: any[]) =>
 * ...` signature probes this type with `TOption = any`, and `any`
 * short-circuits every later branch to `any` instead of `never`.
 */
type UnresolvedAnyOfOption<TOption> =
  IsAny<TOption> extends true
    ? never
    : TOption extends AnyOfOption
      ? TOption extends { readonly type: 'readonly' | 'brand' | 'flavor' }
        ? [unknown] extends [InferInput<TOption>]
          ? TOption
          : never
        : never
      : never;

/**
 * Infers a single option's contribution to the output union. Value-preserving
 * validations contribute the shared (narrowed) input, whereas guards and
 * transforms contribute their own output type.
 */
type InferAnyOfOptionOutput<TOption, TInput> = TOption extends GenericValidation
  ? TInput
  : TOption extends AnyOfOption
    ? InferOutput<TOption>
    : never;

/**
 * Infers the output type, which is the union of every option's output because
 * the first option that succeeds decides the result.
 */
type InferAnyOfOutput<
  TOptions extends AnyOfOptionsConstraint,
  TInput,
> = InferAnyOfOptionOutput<TOptions[number], TInput>;

type InferAnyOfIssue<TOptions extends AnyOfOptionsConstraint> =
  IsNever<ExtractAnyOfOption<TOptions>> extends true
    ? BaseIssue<unknown>
    : InferIssue<ExtractAnyOfOption<TOptions>>;

type ValidAnyOfOptions<TOptions extends AnyOfOptionsConstraint> =
  IsNever<InferAnyOfInput<TOptions>> extends true
    ? never
    : IsNever<UnresolvedAnyOfOption<TOptions[number]>> extends false
      ? never
      : TOptions[number] extends AnyOfOption
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
 * output. Guards and other conditional transformations (e.g. `toNumber`) can
 * still fail and contribute their issues like validations do — only
 * transformations that always succeed (e.g. `trim`) are guaranteed to
 * short-circuit the rest, so place those last. If every option fails, the
 * option issues are collected as subissues of a single any of issue.
 *
 * `readonly()`, `brand(...)` and `flavor(...)` take no other argument that
 * ties their input to a concrete type, so a bare call (e.g. `readonly()`) is
 * rejected as an option — pass an explicit type argument instead, e.g.
 * `readonly<string>()`.
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
    const action = options[index] as UncheckedAnyOfOption | null;

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
          // Copy the matching option's value onto the incoming dataset so
          // value-changing transforms take effect, but keep returning the
          // incoming dataset so issues already present on it (added earlier
          // in the pipe) aren't discarded.
          dataset.value = optionDataset.value;
          return dataset as typeof optionDataset;
        }

        if (optionDataset.typed) {
          typed = true;
        }

        if (optionDataset.issues) {
          (datasets ??= []).push(optionDataset);
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
