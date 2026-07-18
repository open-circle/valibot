import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Null issue interface.
 */
export interface NullIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'null';
  /**
   * The expected property.
   */
  readonly expected: 'null';
}

/**
 * Null schema interface.
 */
export interface NullSchema<
  TMessage extends ErrorMessage<NullIssue> | undefined,
> extends BaseSchema<null, null, NullIssue> {
  /**
   * The schema type.
   */
  readonly type: 'null';
  /**
   * The schema reference.
   */
  readonly reference: typeof null_;
  /**
   * The expected property.
   */
  readonly expects: 'null';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a null schema.
 *
 * @returns A null schema.
 */
export function null_(): NullSchema<undefined>;

/**
 * Creates a null schema.
 *
 * @param message The error message.
 *
 * @returns A null schema.
 */
export function null_<
  const TMessage extends ErrorMessage<NullIssue> | undefined,
>(message: TMessage): NullSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function null_(
  message?: ErrorMessage<NullIssue>
): NullSchema<ErrorMessage<NullIssue> | undefined> {
  return _standardSchema<NullSchema<ErrorMessage<NullIssue> | undefined>>({
    kind: 'schema',
    type: 'null',
    reference: null_,
    expects: 'null',
    async: false,
    message,
    '~run'(
      this: NullSchema<ErrorMessage<NullIssue> | undefined>,
      dataset,
      config
    ) {
      if (dataset.value === null) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<null, NullIssue>;
    },
  });
}

export { null_ as null };
