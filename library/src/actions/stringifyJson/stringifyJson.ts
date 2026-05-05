import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Stringify JSON config interface.
 *
 * @beta
 */
export interface StringifyJsonConfig {
  /**
   * The JSON replacer function or array.
   */
  replacer?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((this: any, key: string, value: any) => any) | (number | string)[];
  /**
   * The JSON space option.
   */
  space?: string | number;
}

/**
 * Stringify JSON issue interface.
 *
 * @beta
 */
export interface StringifyJsonIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'stringify_json';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
}

/**
 * Stringify JSON action interface.
 *
 * @beta
 */
export interface StringifyJsonAction<
  TInput,
  TConfig extends StringifyJsonConfig | undefined,
  TMessage extends ErrorMessage<StringifyJsonIssue<TInput>> | undefined,
> extends BaseTransformation<TInput, string, StringifyJsonIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'stringify_json';
  /**
   * The action reference.
   */
  readonly reference: typeof stringifyJson;
  /**
   * The action config.
   */
  readonly config: TConfig;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a stringify JSON transformation action.
 *
 * @returns A stringify JSON action.
 *
 * @beta
 */
export function stringifyJson<TInput>(): StringifyJsonAction<
  TInput,
  undefined,
  undefined
>;

/**
 * Creates a stringify JSON transformation action.
 *
 * @param config The action config.
 *
 * @returns A stringify JSON action.
 *
 * @beta
 */
export function stringifyJson<
  TInput,
  const TConfig extends StringifyJsonConfig | undefined,
>(config: TConfig): StringifyJsonAction<TInput, TConfig, undefined>;

/**
 * Creates a stringify JSON transformation action.
 *
 * @param config The action config.
 * @param message The error message.
 *
 * @returns A stringify JSON action.
 *
 * @beta
 */
export function stringifyJson<
  TInput,
  const TConfig extends StringifyJsonConfig | undefined,
  const TMessage extends ErrorMessage<StringifyJsonIssue<TInput>> | undefined,
>(
  config: TConfig,
  message: TMessage
): StringifyJsonAction<TInput, TConfig, TMessage>;

// @__NO_SIDE_EFFECTS__
export function stringifyJson(
  config?: StringifyJsonConfig,
  message?: ErrorMessage<StringifyJsonIssue<unknown>>
): StringifyJsonAction<
  unknown,
  StringifyJsonConfig | undefined,
  ErrorMessage<StringifyJsonIssue<unknown>> | undefined
> {
  return {
    kind: 'transformation',
    type: 'stringify_json',
    reference: stringifyJson,
    message,
    config,
    async: false,
    '~run'(dataset, config) {
      try {
        const output = JSON.stringify(
          dataset.value,
          // @ts-expect-error
          this.config?.replacer,
          this.config?.space
        );
        if (output === undefined) {
          _addIssue(this, 'JSON', dataset, config);
          // @ts-expect-error
          dataset.typed = false;
        }
        dataset.value = output;
      } catch (error) {
        if (error instanceof Error) {
          _addIssue(this, 'JSON', dataset, config, {
            received: `"${error.message}"`,
          });
          // @ts-expect-error
          dataset.typed = false;
        } else {
          throw error;
        }
      }
      return dataset as OutputDataset<string, StringifyJsonIssue<unknown>>;
    },
  };
}
