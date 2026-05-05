import { NANO_ID_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Nano ID issue interface.
 */
export interface NanoIdIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'nanoid';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: string;
  /**
   * The Nano ID regex.
   */
  readonly requirement: RegExp;
}

/**
 * Nano ID issue type.
 *
 * @deprecated Use `NanoIdIssue` instead.
 */
export type NanoIDIssue<TInput extends string> = NanoIdIssue<TInput>;

/**
 * Nano ID action interface.
 */
export interface NanoIdAction<
  TInput extends string,
  TMessage extends ErrorMessage<NanoIdIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, NanoIdIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'nanoid';
  /**
   * The action reference.
   */
  readonly reference: typeof nanoid;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The Nano ID regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Nano ID action type.
 *
 * @deprecated Use `NanoIdAction` instead.
 */
export type NanoIDAction<
  TInput extends string,
  TMessage extends ErrorMessage<NanoIdIssue<TInput>> | undefined,
> = NanoIdAction<TInput, TMessage>;

/**
 * Creates a [Nano ID](https://github.com/ai/nanoid) validation action.
 *
 * @returns A Nano ID action.
 */
export function nanoid<TInput extends string>(): NanoIdAction<
  TInput,
  undefined
>;

/**
 * Creates a [Nano ID](https://github.com/ai/nanoid) validation action.
 *
 * @param message The error message.
 *
 * @returns A Nano ID action.
 */
export function nanoid<
  TInput extends string,
  const TMessage extends ErrorMessage<NanoIdIssue<TInput>> | undefined,
>(message: TMessage): NanoIdAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nanoid(
  message?: ErrorMessage<NanoIdIssue<string>>
): NanoIdAction<string, ErrorMessage<NanoIdIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'nanoid',
    reference: nanoid,
    async: false,
    expects: null,
    requirement: NANO_ID_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'Nano ID', dataset, config);
      }
      return dataset;
    },
  };
}
