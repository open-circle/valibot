import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

function isRelativeUrl(value: string): boolean {
  if (value === '') return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  try {
    new URL(value, 'http://example.com');
    return true;
  } catch {
    return false;
  }
}

export interface UrlRelativeIssue<TInput extends string>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'url_relative';
  readonly expected: null;
  readonly received: `"${string}"`;
  readonly requirement: (input: string) => boolean;
}

export interface UrlRelativeAction<
  TInput extends string,
  TMessage extends ErrorMessage<UrlRelativeIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, UrlRelativeIssue<TInput>> {
  readonly type: 'url_relative';
  readonly reference: typeof urlRelative;
  readonly expects: null;
  readonly requirement: (input: string) => boolean;
  readonly message: TMessage;
}

export function urlRelative<TInput extends string>(): UrlRelativeAction<
  TInput,
  undefined
>;

export function urlRelative<
  TInput extends string,
  const TMessage extends ErrorMessage<UrlRelativeIssue<TInput>> | undefined,
>(message: TMessage): UrlRelativeAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function urlRelative(
  message?: ErrorMessage<UrlRelativeIssue<string>>,
): UrlRelativeAction<string, ErrorMessage<UrlRelativeIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'url_relative',
    reference: urlRelative,
    async: false,
    expects: null,
    requirement: isRelativeUrl,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'URL', dataset, config);
      }
      return dataset;
    },
  };
}