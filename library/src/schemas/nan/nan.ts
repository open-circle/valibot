import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * NaN issue interface.
 */
export interface NanIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'nan';
  /**
   * The expected property.
   */
  readonly expected: 'NaN';
}

/**
 * NaN schema interface.
 */
export interface NanSchema<TMessage extends ErrorMessage<NanIssue> | undefined>
  extends BaseSchema<number, number, NanIssue> {
  /**
   * The schema type.
   */
  readonly type: 'nan';
  /**
   * The schema reference.
   */
  readonly reference: typeof nan;
  /**
   * The expected property.
   */
  readonly expects: 'NaN';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a NaN schema.
 *
 * @returns A NaN schema.
 */
export function nan(): NanSchema<undefined>;

/**
 * Creates a NaN schema.
 *
 * @param message The error message.
 *
 * @returns A NaN schema.
 */
export function nan<const TMessage extends ErrorMessage<NanIssue> | undefined>(
  message: TMessage
): NanSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function nan(
  message?: ErrorMessage<NanIssue>
): NanSchema<ErrorMessage<NanIssue> | undefined> {
  return _standardSchema<NanSchema<ErrorMessage<NanIssue> | undefined>>({
    kind: 'schema',
    type: 'nan',
    reference: nan,
    expects: 'NaN',
    async: false,
    message,
    '~run'(
      this: NanSchema<ErrorMessage<NanIssue> | undefined>,
      dataset,
      config
    ) {
      if (Number.isNaN(dataset.value)) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<number, NanIssue>;
    },
  });
}
