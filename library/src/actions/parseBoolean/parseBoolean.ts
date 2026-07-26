import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
  MaybeReadonly,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _joinExpects, _stringify } from '../../utils/index.ts';

const TRUTHY = [true, 1, 'true', '1', 'yes', 'y', 'on', 'enabled'];
const FALSY = [false, 0, 'false', '0', 'no', 'n', 'off', 'disabled'];

/**
 * Parse boolean config interface.
 *
 * @beta
 */
export interface ParseBooleanConfig {
  /**
   * The truthy values.
   */
  truthy?: MaybeReadonly<unknown[]> | undefined;
  /**
   * The falsy values.
   */
  falsy?: MaybeReadonly<unknown[]> | undefined;
}

/**
 * Parse boolean issue interface.
 *
 * @beta
 */
export interface ParseBooleanIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'parse_boolean';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * Parse boolean action interface.
 *
 * @beta
 */
export interface ParseBooleanAction<
  TInput,
  TConfig extends ParseBooleanConfig | undefined,
  TMessage extends
    | ErrorMessage<ParseBooleanIssue<TInput>>
    | undefined = undefined,
> extends BaseTransformation<TInput, boolean, ParseBooleanIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'parse_boolean';
  /**
   * The action reference.
   */
  readonly reference: typeof parseBoolean;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The parse boolean config.
   */
  readonly config: TConfig;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a parse boolean transformation action.
 *
 * @returns A parse boolean action.
 *
 * @beta
 */
export function parseBoolean<TInput>(): ParseBooleanAction<
  TInput,
  undefined,
  undefined
>;

/**
 * Creates a parse boolean transformation action.
 *
 * @param config The parse boolean config.
 *
 * @returns A parse boolean action.
 *
 * @beta
 */
export function parseBoolean<
  TInput,
  const TConfig extends ParseBooleanConfig | undefined,
>(config: TConfig): ParseBooleanAction<TInput, TConfig, undefined>;

/**
 * Creates a parse boolean transformation action.
 *
 * @param config The parse boolean config.
 * @param message The error message.
 *
 * @returns A parse boolean action.
 *
 * @beta
 */
export function parseBoolean<
  TInput,
  const TConfig extends ParseBooleanConfig | undefined,
  const TMessage extends ErrorMessage<ParseBooleanIssue<TInput>> | undefined,
>(
  config: TConfig,
  message: TMessage
): ParseBooleanAction<TInput, TConfig, TMessage>;

// @__NO_SIDE_EFFECTS__
export function parseBoolean(
  config?: ParseBooleanConfig,
  message?: ErrorMessage<ParseBooleanIssue<unknown>>
): ParseBooleanAction<
  unknown,
  ParseBooleanConfig | undefined,
  ErrorMessage<ParseBooleanIssue<unknown>> | undefined
> {
  const normalize = (v: unknown) =>
    typeof v === 'string' ? v.toLowerCase() : v;
  const truthyRaw = config?.truthy ?? TRUTHY;
  const falsyRaw = config?.falsy ?? FALSY;
  const truthy = config?.truthy ? config.truthy.map(normalize) : TRUTHY;
  const falsy = config?.falsy ? config.falsy.map(normalize) : FALSY;
  return {
    kind: 'transformation',
    type: 'parse_boolean',
    reference: parseBoolean,
    expects: _joinExpects([...truthyRaw, ...falsyRaw].map(_stringify), '|'),
    config,
    message,
    async: false,
    '~run'(dataset, config) {
      const input = normalize(dataset.value);
      if (truthy.includes(input)) {
        dataset.value = true;
      } else if (falsy.includes(input)) {
        dataset.value = false;
      } else {
        _addIssue(this, 'boolean', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }
      return dataset as OutputDataset<boolean, ParseBooleanIssue<unknown>>;
    },
  };
}
