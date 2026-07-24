import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';

/**
 * Class type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class = new (...args: any[]) => any;

/**
 * Instance issue interface.
 */
export interface InstanceIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'instance';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * Instance schema interface.
 */
export interface InstanceSchema<
  TClass extends Class,
  TMessage extends ErrorMessage<InstanceIssue> | undefined,
> extends BaseSchema<
    InstanceType<TClass>,
    InstanceType<TClass>,
    InstanceIssue
  > {
  /**
   * The schema type.
   */
  readonly type: 'instance';
  /**
   * The schema reference.
   */
  readonly reference: typeof instance;
  /**
   * The class of the instance.
   */
  readonly class: TClass;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an instance schema.
 *
 * @param class_ The class of the instance.
 *
 * @returns An instance schema.
 */
export function instance<TClass extends Class>(
  class_: TClass
): InstanceSchema<TClass, undefined>;

/**
 * Creates an instance schema.
 *
 * @param class_ The class of the instance.
 * @param message The error message.
 *
 * @returns An instance schema.
 */
export function instance<
  TClass extends Class,
  const TMessage extends ErrorMessage<InstanceIssue> | undefined,
>(class_: TClass, message: TMessage): InstanceSchema<TClass, TMessage>;

// @__NO_SIDE_EFFECTS__
export function instance(
  class_: Class,
  message?: ErrorMessage<InstanceIssue>
): InstanceSchema<Class, ErrorMessage<InstanceIssue> | undefined> {
  return _standardSchema<
    InstanceSchema<Class, ErrorMessage<InstanceIssue> | undefined>
  >({
    kind: 'schema',
    type: 'instance',
    reference: instance,
    expects: class_.name,
    async: false,
    class: class_,
    message,
    '~run'(
      this: InstanceSchema<Class, ErrorMessage<InstanceIssue> | undefined>,
      dataset,
      config
    ) {
      if (dataset.value instanceof this.class) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<InstanceType<Class>, InstanceIssue>;
    },
  });
}
