import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

const BASE64URL_REGEX: RegExp =
  /^(?:[\da-z_-]{4})*(?:[\da-z_-]{2}={0,2}|[\da-z_-]{3}={0,1})?$/iu;

export interface Base64UrlIssue<TInput extends string>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'base64url';
  readonly expected: null;
  readonly received: `"${string}"`;
  readonly requirement: RegExp;
}

export interface Base64UrlAction<
  TInput extends string,
  TMessage extends ErrorMessage<Base64UrlIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, Base64UrlIssue<TInput>> {
  readonly type: 'base64url';
  readonly reference: typeof base64Url;
  readonly expects: null;
  readonly requirement: RegExp;
  readonly message: TMessage;
}

export function base64Url<TInput extends string>(): Base64UrlAction<
  TInput,
  undefined
>;

export function base64Url<
  TInput extends string,
  const TMessage extends ErrorMessage<Base64UrlIssue<TInput>> | undefined,
>(message: TMessage): Base64UrlAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function base64Url(
  message?: ErrorMessage<Base64UrlIssue<string>>,
): Base64UrlAction<string, ErrorMessage<Base64UrlIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'base64url',
    reference: base64Url,
    async: false,
    expects: null,
    requirement: BASE64URL_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'base64url', dataset, config);
      }
      return dataset;
    },
  };
}