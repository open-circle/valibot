import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Boolean issue interface.
 */
export interface BooleanIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'boolean';
  /**
   * The expected property.
   */
  readonly expected: 'boolean';
}

/**
 * Boolean schema interface.
 */
export interface BooleanSchema<
  TMessage extends ErrorMessage<BooleanIssue> | undefined,
> extends BaseSchema<boolean, boolean, BooleanIssue> {
  /**
   * The schema type.
   */
  readonly type: 'boolean';
  /**
   * The schema reference.
   */
  readonly reference: typeof boolean;
  /**
   * The expected property.
   */
  readonly expects: 'boolean';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a boolean schema.
 *
 * @returns A boolean schema.
 */
export function boolean(): BooleanSchema<undefined>;

/**
 * Creates a boolean schema.
 *
 * @param message The error message.
 *
 * @returns A boolean schema.
 */
export function boolean<
  const TMessage extends ErrorMessage<BooleanIssue> | undefined,
>(message: TMessage): BooleanSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function boolean(
  message?: ErrorMessage<BooleanIssue>
): BooleanSchema<ErrorMessage<BooleanIssue> | undefined> {
  return _standardSchema<BooleanSchema<ErrorMessage<BooleanIssue> | undefined>>(
    {
      kind: 'schema',
      type: 'boolean',
      reference: boolean,
      expects: 'boolean',
      async: false,
      message,
      '~run'(
        this: BooleanSchema<ErrorMessage<BooleanIssue> | undefined>,
        dataset,
        config
      ) {
        if (typeof dataset.value === 'boolean') {
          // @ts-expect-error
          dataset.typed = true;
        } else {
          _addIssue(this, 'type', dataset, config);
        }
        // @ts-expect-error
        return dataset as OutputDataset<boolean, BooleanIssue>;
      },
    }
  );
}
