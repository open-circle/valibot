import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  FailureDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Never issue interface.
 */
export interface NeverIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'never';
  /**
   * The expected property.
   */
  readonly expected: 'never';
}

/**
 * Never schema interface.
 */
export interface NeverSchema<
  TMessage extends ErrorMessage<NeverIssue> | undefined,
> extends BaseSchema<never, never, NeverIssue> {
  /**
   * The schema type.
   */
  readonly type: 'never';
  /**
   * The schema reference.
   */
  readonly reference: typeof never;
  /**
   * The expected property.
   */
  readonly expects: 'never';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a never schema.
 *
 * @returns A never schema.
 */
export function never(): NeverSchema<undefined>;

/**
 * Creates a never schema.
 *
 * @param message The error message.
 *
 * @returns A never schema.
 */
export function never<
  const TMessage extends ErrorMessage<NeverIssue> | undefined,
>(message: TMessage): NeverSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function never(
  message?: ErrorMessage<NeverIssue>
): NeverSchema<ErrorMessage<NeverIssue> | undefined> {
  return _standardSchema<NeverSchema<ErrorMessage<NeverIssue> | undefined>>({
    kind: 'schema',
    type: 'never',
    reference: never,
    expects: 'never',
    async: false,
    message,
    '~run'(
      this: NeverSchema<ErrorMessage<NeverIssue> | undefined>,
      dataset,
      config
    ) {
      _addIssue(this, 'type', dataset, config);
      // @ts-expect-error
      return dataset as FailureDataset<NeverIssue>;
    },
  });
}
