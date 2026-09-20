import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _stringify } from '../../utils/index.ts';
import type { ContentInput, ContentRequirement } from '../types.ts';

/**
 * Includes issue interface.
 */
export interface IncludesIssue<
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
  readonly type: 'includes';
  /**
   * The expected property.
   */
  readonly expected: string;
  /**
   * The content to be included.
   */
  readonly requirement: TRequirement;
}

/**
 * Includes action interface.
 */
export interface IncludesAction<
  TInput extends ContentInput,
  TRequirement extends ContentRequirement<TInput>,
  TMessage extends
    ErrorMessage<IncludesIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, IncludesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'includes';
  /**
   * The action reference.
   */
  readonly reference: typeof includes;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The content to be included.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an includes validation action.
 *
 * @param requirement The content to be included.
 *
 * @returns An includes action.
 */
export function includes<
  TInput extends ContentInput,
  const TRequirement extends ContentRequirement<TInput>,
>(requirement: TRequirement): IncludesAction<TInput, TRequirement, undefined>;

/**
 * Creates an includes validation action.
 *
 * @param requirement The content to be included.
 * @param message The error message.
 *
 * @returns An includes action.
 */
export function includes<
  TInput extends ContentInput,
  const TRequirement extends ContentRequirement<TInput>,
  const TMessage extends
    ErrorMessage<IncludesIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): IncludesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function includes(
  requirement: ContentRequirement<ContentInput>,
  message?: ErrorMessage<
    IncludesIssue<ContentInput, ContentRequirement<ContentInput>>
  >
): IncludesAction<
  ContentInput,
  ContentRequirement<ContentInput>,
  | ErrorMessage<IncludesIssue<ContentInput, ContentRequirement<ContentInput>>>
  | undefined
> {
  const expects = _stringify(requirement);
  return {
    kind: 'validation',
    type: 'includes',
    reference: includes,
    async: false,
    expects,
    requirement,
    message,
    '~run'(dataset, config) {
      // @ts-expect-error
      if (dataset.typed && !dataset.value.includes(this.requirement)) {
        _addIssue(this, 'content', dataset, config, {
          received: `!${expects}`,
        });
      }
      return dataset;
    },
  };
}
