import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Guard function type.
 *
 * @beta
 */
export type GuardFunction<TInput> = (
  input: TInput
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => input is any;

/**
 * Infer guard output type.
 *
 * @beta
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferGuardOutput<TGuard extends GuardFunction<any>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TGuard extends (input: any) => input is infer TOutput ? TOutput : unknown;

/**
 * Guard issue interface.
 *
 * @beta
 */
export interface GuardIssue<TInput, TGuard extends GuardFunction<TInput>>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'guard';
  /**
   * The guard function.
   */
  readonly requirement: TGuard;
}

/**
 * Guard action interface.
 *
 * @beta
 */
export interface GuardAction<
  TInput,
  TGuard extends GuardFunction<TInput>,
  TMessage extends ErrorMessage<GuardIssue<TInput, TGuard>> | undefined,
> extends BaseTransformation<
    TInput,
    // intersect in case guard is actually wider
    TInput & InferGuardOutput<TGuard>,
    GuardIssue<TInput, TGuard>
  > {
  /**
   * The action type.
   */
  readonly type: 'guard';
  /**
   * The action reference.
   */
  readonly reference: typeof guard;
  /**
   * The guard function.
   */
  readonly requirement: TGuard;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a guard transformation action.
 *
 * @param requirement The guard function.
 *
 * @returns A guard action.
 *
 * @beta
 */
// known input from pipe
export function guard<TInput, const TGuard extends GuardFunction<TInput>>(
  requirement: TGuard
): GuardAction<TInput, TGuard, undefined>;

/**
 * Creates a guard transformation action.
 *
 * @param requirement The guard function.
 *
 * @returns A guard action.
 *
 * @beta
 */
// unknown input, e.g. standalone
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function guard<const TGuard extends GuardFunction<any>>(
  requirement: TGuard
): GuardAction<Parameters<TGuard>[0], TGuard, undefined>;

/**
 * Creates a guard transformation action.
 *
 * @param requirement The guard function.
 * @param message The error message.
 *
 * @returns A guard action.
 *
 * @beta
 */
// known input from pipe
export function guard<
  TInput,
  const TGuard extends GuardFunction<TInput>,
  const TMessage extends ErrorMessage<GuardIssue<TInput, TGuard>> | undefined,
>(
  requirement: TGuard,
  message: TMessage
): GuardAction<TInput, TGuard, TMessage>;

/**
 * Creates a guard transformation action.
 *
 * @param requirement The guard function.
 * @param message The error message.
 *
 * @returns A guard action.
 *
 * @beta
 */
// unknown input, e.g. standalone
export function guard<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TGuard extends GuardFunction<any>,
  const TMessage extends
    | ErrorMessage<GuardIssue<Parameters<TGuard>[0], TGuard>>
    | undefined,
>(
  requirement: TGuard,
  message: TMessage
): GuardAction<Parameters<TGuard>[0], TGuard, TMessage>;

// @__NO_SIDE_EFFECTS__
export function guard(
  requirement: GuardFunction<unknown>,
  message?: ErrorMessage<GuardIssue<unknown, GuardFunction<unknown>>>
): GuardAction<
  unknown,
  GuardFunction<unknown>,
  ErrorMessage<GuardIssue<unknown, GuardFunction<unknown>>> | undefined
> {
  return {
    kind: 'transformation',
    type: 'guard',
    reference: guard,
    async: false,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'input', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }
      return dataset;
    },
  };
}
