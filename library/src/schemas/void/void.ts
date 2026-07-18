import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Void issue interface.
 */
export interface VoidIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'void';
  /**
   * The expected property.
   */
  readonly expected: 'void';
}

/**
 * Void schema interface.
 */
export interface VoidSchema<
  TMessage extends ErrorMessage<VoidIssue> | undefined,
> extends BaseSchema<void, void, VoidIssue> {
  /**
   * The schema type.
   */
  readonly type: 'void';
  /**
   * The schema reference.
   */
  readonly reference: typeof void_;
  /**
   * The expected property.
   */
  readonly expects: 'void';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a void schema.
 *
 * @returns A void schema.
 */
export function void_(): VoidSchema<undefined>;

/**
 * Creates a void schema.
 *
 * @param message The error message.
 *
 * @returns A void schema.
 */
export function void_<
  const TMessage extends ErrorMessage<VoidIssue> | undefined,
>(message: TMessage): VoidSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function void_(
  message?: ErrorMessage<VoidIssue>
): VoidSchema<ErrorMessage<VoidIssue> | undefined> {
  return _standardSchema<VoidSchema<ErrorMessage<VoidIssue> | undefined>>({
    kind: 'schema',
    type: 'void',
    reference: void_,
    expects: 'void',
    async: false,
    message,
    '~run'(
      this: VoidSchema<ErrorMessage<VoidIssue> | undefined>,
      dataset,
      config
    ) {
      if (dataset.value === undefined) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<void, VoidIssue>;
    },
  });
}

export { void_ as void };
