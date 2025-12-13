import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';

/**
 * FormData issue interface.
 */
export interface FormDataIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'form_data';
  /**
   * The expected property.
   */
  readonly expected: 'FormData';
}

/**
 * FormData schema interface.
 */
export interface FormDataSchema<
  TMessage extends ErrorMessage<FormDataIssue> | undefined,
> extends BaseSchema<FormData, FormData, FormDataIssue> {
  /**
   * The schema type.
   */
  readonly type: 'form_data';
  /**
   * The schema reference.
   */
  readonly reference: typeof formData;
  /**
   * The expected property.
   */
  readonly expects: 'FormData';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a formData schema.
 *
 * @returns A formData schema.
 */
export function formData(): FormDataSchema<undefined>;

/**
 * Creates a formData schema.
 *
 * @param message The error message.
 *
 * @returns A formData schema.
 */
export function formData<
  const TMessage extends ErrorMessage<FormDataIssue> | undefined,
>(message: TMessage): FormDataSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function formData(
  message?: ErrorMessage<FormDataIssue>
): FormDataSchema<ErrorMessage<FormDataIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'form_data',
    reference: formData,
    expects: 'FormData',
    async: false,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      if (dataset.value instanceof FormData) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<FormData, FormDataIssue>;
    },
  };
}
