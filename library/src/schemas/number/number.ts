import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Number issue interface.
 */
export interface NumberIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'number';
  /**
   * The expected property.
   */
  readonly expected: 'number';
}

/**
 * Number schema interface.
 */
export interface NumberSchema<
  TMessage extends ErrorMessage<NumberIssue> | undefined,
> extends BaseSchema<number, number, NumberIssue> {
  /**
   * The schema type.
   */
  readonly type: 'number';
  /**
   * The schema reference.
   */
  readonly reference: typeof number;
  /**
   * The expected property.
   */
  readonly expects: 'number';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a number schema.
 *
 * @returns A number schema.
 */
export function number(): NumberSchema<undefined>;

/**
 * Creates a number schema.
 *
 * @param message The error message.
 *
 * @returns A number schema.
 */
export function number<
  const TMessage extends ErrorMessage<NumberIssue> | undefined,
>(message: TMessage): NumberSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function number(
  message?: ErrorMessage<NumberIssue>
): NumberSchema<ErrorMessage<NumberIssue> | undefined> {
  return _standardSchema<NumberSchema<ErrorMessage<NumberIssue> | undefined>>({
    kind: 'schema',
    type: 'number',
    reference: number,
    expects: 'number',
    async: false,
    message,
    '~run'(
      this: NumberSchema<ErrorMessage<NumberIssue> | undefined>,
      dataset,
      config
    ) {
      if (typeof dataset.value === 'number' && !isNaN(dataset.value)) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<number, NumberIssue>;
    },
  });
}
