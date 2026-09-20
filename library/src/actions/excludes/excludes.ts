import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _stringify } from '../../utils/index.ts';
import type { ContentInput, ContentRequirement } from '../types.ts';

/**
 * Excludes issue interface.
 */
export interface ExcludesIssue<
  TInput extends ContentInput,
  TRequirement extends ContentRequirement<TInput>,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'excludes';
  /**
   * The expected property.
   */
  readonly expected: string;
  /**
   * The content to be excluded.
   */
  readonly requirement: TRequirement;
}

/**
 * Excludes action interface.
 */
export interface ExcludesAction<
  TInput extends ContentInput,
  TRequirement extends ContentRequirement<TInput>,
  TMessage extends
    ErrorMessage<ExcludesIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, ExcludesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'excludes';
  /**
   * The action reference.
   */
  readonly reference: typeof excludes;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The content to be excluded.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an excludes validation action.
 *
 * @param requirement The content to be excluded.
 *
 * @returns An excludes action.
 */
export function excludes<
  TInput extends ContentInput,
  const TRequirement extends ContentRequirement<TInput>,
>(requirement: TRequirement): ExcludesAction<TInput, TRequirement, undefined>;

/**
 * Creates an excludes validation action.
 *
 * @param requirement The content to be excluded.
 * @param message The error message.
 *
 * @returns An excludes action.
 */
export function excludes<
  TInput extends ContentInput,
  const TRequirement extends ContentRequirement<TInput>,
  const TMessage extends
    ErrorMessage<ExcludesIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): ExcludesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function excludes(
  requirement: ContentRequirement<ContentInput>,
  message?: ErrorMessage<
    ExcludesIssue<ContentInput, ContentRequirement<ContentInput>>
  >
): ExcludesAction<
  ContentInput,
  ContentRequirement<ContentInput>,
  | ErrorMessage<ExcludesIssue<ContentInput, ContentRequirement<ContentInput>>>
  | undefined
> {
  const received = _stringify(requirement);
  return {
    kind: 'validation',
    type: 'excludes',
    reference: excludes,
    async: false,
    expects: `!${received}`,
    requirement,
    message,
    '~run'(dataset, config) {
      // @ts-expect-error
      if (dataset.typed && dataset.value.includes(this.requirement)) {
        _addIssue(this, 'content', dataset, config, { received });
      }
      return dataset;
    },
  };
}
