import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  isPlainObject,
} from '../../utils/index.ts';

/**
 * POJO issue interface.
 */
export interface PojoIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'pojo';
  /**
   * The expected property.
   */
  readonly expected: 'Object';
}

/**
 * POJO schema interface.
 */
export interface PojoSchema<
  TMessage extends ErrorMessage<PojoIssue> | undefined,
> extends BaseSchema<
    Record<string, unknown>,
    Record<string, unknown>,
    PojoIssue
  > {
  /**
   * The schema type.
   */
  readonly type: 'pojo';
  /**
   * The schema reference.
   */
  readonly reference: typeof pojo;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The error message.
   */
  readonly message: TMessage;
}
/**
 * Creates a POJO schema.
 *
 * @returns A POJO schema.
 */
export function pojo(): PojoSchema<undefined>;

/**
 * Creates a POJO schema.
 *
 * @param message The error message.
 *
 * @returns A POJO schema.
 */
export function pojo<TMessage extends ErrorMessage<PojoIssue> | undefined>(
  message?: TMessage
): PojoSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function pojo(
  message?: ErrorMessage<PojoIssue> | undefined
): PojoSchema<ErrorMessage<PojoIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'pojo',
    reference: pojo,
    expects: 'Object',
    async: false,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      if (isPlainObject(dataset.value)) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<Record<string, unknown>, PojoIssue>;
    },
  };
}
