import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  MaybeReadonly,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _joinExpects,
  _stringify,
} from '../../utils/index.ts';

/**
 * Picklist options type.
 */
export type PicklistOptions = MaybeReadonly<(string | number | bigint)[]>;

/**
 * Picklist issue interface.
 */
export interface PicklistIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'picklist';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * Picklist schema interface.
 */
export interface PicklistSchema<
  TOptions extends PicklistOptions,
  TMessage extends ErrorMessage<PicklistIssue> | undefined,
> extends BaseSchema<TOptions[number], TOptions[number], PicklistIssue> {
  /**
   * The schema type.
   */
  readonly type: 'picklist';
  /**
   * The schema reference.
   */
  readonly reference: typeof picklist;
  /**
   * The picklist options.
   */
  readonly options: TOptions;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a picklist schema.
 *
 * @param options The picklist options.
 *
 * @returns A picklist schema.
 */
export function picklist<const TOptions extends PicklistOptions>(
  options: TOptions
): PicklistSchema<TOptions, undefined>;

/**
 * Creates a picklist schema.
 *
 * @param options The picklist options.
 * @param message The error message.
 *
 * @returns A picklist schema.
 */
export function picklist<
  const TOptions extends PicklistOptions,
  const TMessage extends ErrorMessage<PicklistIssue> | undefined,
>(options: TOptions, message: TMessage): PicklistSchema<TOptions, TMessage>;

// @__NO_SIDE_EFFECTS__
export function picklist(
  options: PicklistOptions,
  message?: ErrorMessage<PicklistIssue>
): PicklistSchema<PicklistOptions, ErrorMessage<PicklistIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'picklist',
    reference: picklist,
    expects: _joinExpects(options.map(_stringify), '|'),
    async: false,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Lazily cache the options as a set for O(1) membership checks. This is
      // faster than `Array.includes` for large option lists and uses
      // SameValueZero comparison, so behavior is identical.
      // @ts-expect-error
      const optionsSet: Set<unknown> = (this._optionsSet ??= new Set(
        this.options
      ));
      if (optionsSet.has(dataset.value)) {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<PicklistOptions[number], PicklistIssue>;
    },
  };
}
