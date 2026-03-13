import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Parse JSON config interface.
 *
 * @beta
 */
export interface ParseJsonConfig {
  /**
   * The JSON reviver function.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviver?: (this: any, key: string, value: any) => any;
}

/**
 * Parse JSON issue interface.
 *
 * @beta
 */
export interface ParseJsonIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'parse_json';
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
 * Parse JSON action interface.
 *
 * @beta
 */
export interface ParseJsonAction<
  TInput extends string,
  TConfig extends ParseJsonConfig | undefined,
  TMessage extends ErrorMessage<ParseJsonIssue<TInput>> | undefined,
> extends BaseTransformation<TInput, unknown, ParseJsonIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'parse_json';
  /**
   * The action reference.
   */
  readonly reference: typeof parseJson;
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
 * Creates a parse JSON transformation action.
 *
 * @returns A parse JSON action.
 *
 * @beta
 */
export function parseJson<TInput extends string>(): ParseJsonAction<
  TInput,
  undefined,
  undefined
>;

/**
 * Creates a parse JSON transformation action.
 *
 * @param config The action config.
 *
 * @returns A parse JSON action.
 *
 * @beta
 */
export function parseJson<
  TInput extends string,
  const TConfig extends ParseJsonConfig | undefined,
>(config: TConfig): ParseJsonAction<TInput, TConfig, undefined>;

/**
 * Creates a parse JSON transformation action.
 *
 * @param config The action config.
 * @param message The error message.
 *
 * @returns A parse JSON action.
 *
 * @beta
 */
export function parseJson<
  TInput extends string,
  const TConfig extends ParseJsonConfig | undefined,
  const TMessage extends ErrorMessage<ParseJsonIssue<TInput>> | undefined,
>(
  config: TConfig,
  message: TMessage
): ParseJsonAction<TInput, TConfig, TMessage>;

// @__NO_SIDE_EFFECTS__
export function parseJson(
  config?: ParseJsonConfig,
  message?: ErrorMessage<ParseJsonIssue<string>>
): ParseJsonAction<
  string,
  ParseJsonConfig | undefined,
  ErrorMessage<ParseJsonIssue<string>> | undefined
> {
  return {
    kind: 'transformation',
    type: 'parse_json',
    reference: parseJson,
    config,
    message,
    async: false,
    '~run'(dataset, config) {
      try {
        dataset.value = JSON.parse(dataset.value, this.config?.reviver);
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
      return dataset;
    },
  };
}
