import type {
  BaseIssue,
  GenericTransformation,
  GenericTransformationAsync,
  GenericValidation,
  GenericValidationAsync,
  InferInput,
  InferIssue,
  InferOutput,
  IsNever,
  MaybeReadonly,
  UnionToIntersect,
} from '../../types/index.ts';
import type { BrandAction } from '../brand/index.ts';
import type { FlavorAction } from '../flavor/index.ts';
import type { ReadonlyAction } from '../readonly/index.ts';

export type AnyOfOption = GenericValidation | GenericTransformation;
export type AnyOfOptionAsync =
  | AnyOfOption
  | GenericValidationAsync
  | GenericTransformationAsync;

/**
 * Loose option tuples preserve inference before `ValidAnyOfOptions` checks them.
 */
export type AnyOfOptionsConstraint = MaybeReadonly<
  [unknown, unknown, ...unknown[]]
>;

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
type InferAnyOfOptionInput<TOption> = TOption extends AnyOfOptionAsync
  ? { input: InferInput<TOption> }
  : { input: unknown };

export type InferAnyOfInput<TOptions extends readonly unknown[]> =
  UnionToIntersect<InferAnyOfOptionInput<TOptions[number]>> extends {
    input: infer TInput;
  }
    ? TInput
    : never;

/**
 * Validations preserve the shared input. Type-only transformations with an
 * inferred unknown input apply their output type to that shared input.
 */
export type InferAnyOfOptionOutput<TOption, TInput> = TOption extends {
  readonly type: 'any_of';
  readonly options: infer TOptions extends AnyOfOptionsConstraint;
}
  ? InferAnyOfOptionOutput<TOptions[number], TInput>
  : TOption extends GenericValidation | GenericValidationAsync
    ? TInput
    : TOption extends BrandAction<unknown, infer TName>
      ? InferOutput<BrandAction<TInput, TName>>
      : TOption extends FlavorAction<unknown, infer TName>
        ? InferOutput<FlavorAction<TInput, TName>>
        : TOption extends ReadonlyAction<unknown>
          ? InferOutput<ReadonlyAction<TInput>>
          : TOption extends AnyOfOptionAsync
            ? InferOutput<TOption>
            : never;

export type InferAnyOfIssue<
  TOptions extends AnyOfOptionsConstraint,
  TOption extends AnyOfOptionAsync = Extract<
    TOptions[number],
    AnyOfOptionAsync
  >,
> = IsNever<TOption> extends true ? BaseIssue<unknown> : InferIssue<TOption>;

export type ValidAnyOfOptions<
  TOptions extends AnyOfOptionsConstraint,
  TOption extends AnyOfOptionAsync,
> =
  IsNever<InferAnyOfInput<TOptions>> extends true
    ? never
    : TOptions[number] extends TOption
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
