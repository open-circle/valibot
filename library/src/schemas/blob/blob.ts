import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Blob issue interface.
 */
export interface BlobIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'blob';
  /**
   * The expected property.
   */
  readonly expected: 'Blob';
}

/**
 * Blob schema interface.
 */
export interface BlobSchema<
  TMessage extends ErrorMessage<BlobIssue> | undefined,
> extends BaseSchema<Blob, Blob, BlobIssue> {
  /**
   * The schema type.
   */
  readonly type: 'blob';
  /**
   * The schema reference.
   */
  readonly reference: typeof blob;
  /**
   * The expected property.
   */
  readonly expects: 'Blob';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a blob schema.
 *
 * @returns A blob schema.
 */
export function blob(): BlobSchema<undefined>;

/**
 * Creates a blob schema.
 *
 * @param message The error message.
 *
 * @returns A blob schema.
 */
export function blob<
  const TMessage extends ErrorMessage<BlobIssue> | undefined,
>(message: TMessage): BlobSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function blob(
  message?: ErrorMessage<BlobIssue>
): BlobSchema<ErrorMessage<BlobIssue> | undefined> {
  return _standardSchema<BlobSchema<ErrorMessage<BlobIssue> | undefined>>({
    kind: 'schema',
    type: 'blob',
    reference: blob,
    expects: 'Blob',
    async: false,
    message,
    '~run'(
      this: BlobSchema<ErrorMessage<BlobIssue> | undefined>,
      dataset,
      config
    ) {
      if (dataset.value instanceof Blob) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<Blob, BlobIssue>;
    },
  });
}
