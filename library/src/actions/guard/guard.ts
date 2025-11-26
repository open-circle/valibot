import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

type BaseGuard<TInput> = (
  input: TInput
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => input is any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferGuarded<TGuard extends BaseGuard<any>> = TGuard extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any
) => input is infer TOutput
  ? TOutput
  : unknown;

/**
 * Guard issue interface.
 */
export interface GuardIssue<TInput, TGuard extends BaseGuard<TInput>>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The validation type.
   */
  readonly type: 'guard';
  /**
   * The validation requirement.
   */
  readonly requirement: TGuard;
}

/**
 * Guard action interface.
 */
export interface GuardAction<
  TInput,
  TGuard extends BaseGuard<TInput>,
  TMessage extends ErrorMessage<GuardIssue<TInput, TGuard>> | undefined,
> extends BaseTransformation<
    TInput,
    // intersect in case guard is actually wider
    TInput & InferGuarded<TGuard>,
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
 * Creates a guard validation action.
 *
 * @param requirement The guard function.
 *
 * @returns A guard action.
 */
// known input from pipe
export function guard<TInput, const TGuard extends BaseGuard<TInput>>(
  requirement: TGuard
): GuardAction<TInput, TGuard, undefined>;

/**
 * Creates a guard validation action.
 *
 * @param requirement The guard function.
 *
 * @returns A guard action.
 */
// unknown input, e.g. standalone
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function guard<const TGuard extends BaseGuard<any>>(
  requirement: TGuard
): GuardAction<Parameters<TGuard>[0], TGuard, undefined>;

/**
 * Creates a guard validation action.
 *
 * @param requirement The guard function.
 * @param message The error message.
 *
 * @returns A guard action.
 */
// known input from pipe
export function guard<
  TInput,
  const TGuard extends BaseGuard<TInput>,
  const TMessage extends ErrorMessage<GuardIssue<TInput, TGuard>> | undefined,
>(
  requirement: TGuard,
  message: TMessage
): GuardAction<TInput, TGuard, TMessage>;

/**
 * Creates a guard validation action.
 *
 * @param requirement The guard function.
 * @param message The error message.
 *
 * @returns A guard action.
 */
// unknown input, e.g. standalone
export function guard<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TGuard extends BaseGuard<any>,
  const TMessage extends
    | ErrorMessage<GuardIssue<Parameters<TGuard>[0], TGuard>>
    | undefined,
>(
  requirement: TGuard,
  message: TMessage
): GuardAction<Parameters<TGuard>[0], TGuard, TMessage>;

// @__NO_SIDE_EFFECTS__
export function guard(
  requirement: BaseGuard<unknown>,
  message?: ErrorMessage<GuardIssue<unknown, BaseGuard<unknown>>>
): GuardAction<
  unknown,
  BaseGuard<unknown>,
  ErrorMessage<GuardIssue<unknown, BaseGuard<unknown>>> | undefined
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
