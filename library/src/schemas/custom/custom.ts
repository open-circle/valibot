import type {
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { CustomIssue } from './types.ts';

/**
 * Check type.
 */
type Check = (input: unknown) => boolean;

/**
 * Custom schema interface.
 */
export interface CustomSchema<
  TInput,
  TMessage extends ErrorMessage<CustomIssue> | undefined,
> extends BaseSchema<TInput, TInput, CustomIssue> {
  /**
   * The schema type.
   */
  readonly type: 'custom';
  /**
   * The schema reference.
   */
  readonly reference: typeof custom;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The type check function.
   */
  readonly check: Check;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a custom schema.
 *
 * @param check The type check function.
 *
 * @returns A custom schema.
 */
export function custom<TInput>(check: Check): CustomSchema<TInput, undefined>;

/**
 * Creates a custom schema.
 *
 * @param check The type check function.
 * @param message The error message.
 *
 * @returns A custom schema.
 */
export function custom<
  TInput,
  const TMessage extends ErrorMessage<CustomIssue> | undefined =
    | ErrorMessage<CustomIssue>
    | undefined,
>(check: Check, message: TMessage): CustomSchema<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function custom<TInput>(
  check: Check,
  message?: ErrorMessage<CustomIssue>
): CustomSchema<TInput, ErrorMessage<CustomIssue> | undefined> {
  return _standardSchema<
    CustomSchema<TInput, ErrorMessage<CustomIssue> | undefined>
  >({
    kind: 'schema',
    type: 'custom',
    reference: custom,
    expects: 'unknown',
    async: false,
    check,
    message,
    '~run'(
      this: CustomSchema<TInput, ErrorMessage<CustomIssue> | undefined>,
      dataset,
      config
    ) {
      if (this.check(dataset.value)) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<TInput, CustomIssue>;
    },
  });
}
