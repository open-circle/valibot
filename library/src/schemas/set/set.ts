import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  InferIssue,
  OutputDataset,
  SetPathItem,
  UnknownDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type { InferSetInput, InferSetOutput, SetIssue } from './types.ts';

/**
 * Set schema interface.
 */
export interface SetSchema<
  TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<SetIssue> | undefined,
> extends BaseSchema<
    InferSetInput<TValue>,
    InferSetOutput<TValue>,
    SetIssue | InferIssue<TValue>
  > {
  /**
   * The schema type.
   */
  readonly type: 'set';
  /**
   * The schema reference.
   */
  readonly reference: typeof set;
  /**
   * The expected property.
   */
  readonly expects: 'Set';
  /**
   * The set value schema.
   */
  readonly value: TValue;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a set schema.
 *
 * @param value The value schema.
 *
 * @returns A set schema.
 */
export function set<
  const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(value: TValue): SetSchema<TValue, undefined>;

/**
 * Creates a set schema.
 *
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A set schema.
 */
export function set<
  const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<SetIssue> | undefined,
>(value: TValue, message: TMessage): SetSchema<TValue, TMessage>;

// @__NO_SIDE_EFFECTS__
export function set(
  value: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<SetIssue>
): SetSchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<SetIssue> | undefined
> {
  const _valueRun = value['~run'].bind(value) as typeof value['~run'];
  const _valueDataset: UnknownDataset = { value: undefined, typed: false, issues: undefined };

  return {
    kind: 'schema',
    type: 'set',
    reference: set,
    expects: 'Set',
    async: false,
    value,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input instanceof Set) {
        // Set typed to `true` and value to empty set
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = new Set();

        // Parse schema of each set value
        for (const inputValue of input) {
          _valueDataset.value = inputValue;
          _valueDataset.typed = false;
          _valueDataset.issues = undefined;
          const valueDataset = _valueRun(_valueDataset, config);

          // If there are issues, capture them
          if (valueDataset.issues) {
            // Create set path item
            const pathItem: SetPathItem = {
              type: 'set',
              origin: 'value',
              input,
              key: null,
              value: inputValue,
            };

            // Add modified item dataset issues to issues
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                // @ts-expect-error
                issue.path = [pathItem];
              }
              // @ts-expect-error
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              // @ts-expect-error
              dataset.issues = valueDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If not typed, set typed to `false`
          if (!valueDataset.typed) {
            dataset.typed = false;
          }

          // Add value to dataset
          // @ts-expect-error
          dataset.value.add(valueDataset.value);
        }

        // Otherwise, add set issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        Set<unknown>,
        SetIssue | BaseIssue<unknown>
      >;
    },
  };
}
