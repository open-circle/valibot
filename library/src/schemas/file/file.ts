import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * File issue interface.
 */
export interface FileIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'file';
  /**
   * The expected property.
   */
  readonly expected: 'File';
}

/**
 * File schema interface.
 */
export interface FileSchema<
  TMessage extends ErrorMessage<FileIssue> | undefined,
> extends BaseSchema<File, File, FileIssue> {
  /**
   * The schema type.
   */
  readonly type: 'file';
  /**
   * The schema reference.
   */
  readonly reference: typeof file;
  /**
   * The expected property.
   */
  readonly expects: 'File';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a file schema.
 *
 * @returns A file schema.
 */
export function file(): FileSchema<undefined>;

/**
 * Creates a file schema.
 *
 * @param message The error message.
 *
 * @returns A file schema.
 */
export function file<
  const TMessage extends ErrorMessage<FileIssue> | undefined,
>(message: TMessage): FileSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function file(
  message?: ErrorMessage<FileIssue>
): FileSchema<ErrorMessage<FileIssue> | undefined> {
  return _standardSchema<FileSchema<ErrorMessage<FileIssue> | undefined>>({
    kind: 'schema',
    type: 'file',
    reference: file,
    expects: 'File',
    async: false,
    message,
    '~run'(
      this: FileSchema<ErrorMessage<FileIssue> | undefined>,
      dataset,
      config
    ) {
      if (dataset.value instanceof File) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<File, FileIssue>;
    },
  });
}
