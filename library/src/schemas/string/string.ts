import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * String issue interface.
 */
export interface StringIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'string';
  /**
   * The expected property.
   */
  readonly expected: 'string';
}

/**
 * String schema interface.
 */
export interface StringSchema<
  TMessage extends ErrorMessage<StringIssue> | undefined,
> extends BaseSchema<string, string, StringIssue> {
  /**
   * The schema type.
   */
  readonly type: 'string';
  /**
   * The schema reference.
   */
  readonly reference: typeof string;
  /**
   * The expected property.
   */
  readonly expects: 'string';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a string schema.
 *
 * @returns A string schema.
 */
export function string(): StringSchema<undefined>;

/**
 * Creates a string schema.
 *
 * @param message The error message.
 *
 * @returns A string schema.
 */
export function string<
  const TMessage extends ErrorMessage<StringIssue> | undefined,
>(message: TMessage): StringSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function string(
  message?: ErrorMessage<StringIssue>
): StringSchema<ErrorMessage<StringIssue> | undefined> {
  return _standardSchema<StringSchema<ErrorMessage<StringIssue> | undefined>>({
    kind: 'schema',
    type: 'string',
    reference: string,
    expects: 'string',
    async: false,
    message,
    '~run'(
      this: StringSchema<ErrorMessage<StringIssue> | undefined>,
      dataset,
      config
    ) {
      if (typeof dataset.value === 'string') {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<string, StringIssue>;
    },
  });
}
