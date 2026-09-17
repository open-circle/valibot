import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * The [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) time regex. Matches
 * `HH:MM:SS` with optional fractional seconds and an optional UTC or numeric
 * offset (`Z` or `+/-HH:MM`). See issue #1496.
 */
const RFC_3339_TIME_REGEX: RegExp =
  /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)?$/u;

/**
 * RFC 3339 time issue interface.
 */
export interface Rfc3339TimeIssue<TInput extends string>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'rfc3339_time';
  readonly expected: null;
  readonly received: `"${string}"`;
  readonly requirement: RegExp;
}

/**
 * RFC 3339 time action interface.
 */
export interface Rfc3339TimeAction<
  TInput extends string,
  TMessage extends ErrorMessage<Rfc3339TimeIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, Rfc3339TimeIssue<TInput>> {
  readonly type: 'rfc3339_time';
  readonly reference: typeof rfc3339Time;
  readonly expects: null;
  readonly requirement: RegExp;
  readonly message: TMessage;
}

/**
 * Creates an [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) time validation
 * action.
 *
 * Format: `HH:MM:SS` with optional fractional seconds and an optional UTC or
 * numeric offset (`Z` or `+/-HH:MM`), e.g. `14:30:00`, `14:30:00Z`,
 * `14:30:00.123-05:00`. Unlike {@link isoTime} (`HH:MM`) and
 * {@link isoTimeSecond} (`HH:MM:SS`), this accepts the RFC 3339 offset and
 * fractional-seconds forms needed for OpenAPI `format: time`. See issue #1496.
 *
 * @returns An RFC 3339 time action.
 */
export function rfc3339Time<TInput extends string>(): Rfc3339TimeAction<
  TInput,
  undefined
>;

/**
 * Creates an RFC 3339 time validation action.
 *
 * @param message The error message.
 *
 * @returns An RFC 3339 time action.
 */
export function rfc3339Time<
  TInput extends string,
  const TMessage extends ErrorMessage<Rfc3339TimeIssue<TInput>> | undefined,
>(message: TMessage): Rfc3339TimeAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function rfc3339Time(
  message?: ErrorMessage<Rfc3339TimeIssue<string>>,
): Rfc3339TimeAction<string, ErrorMessage<Rfc3339TimeIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'rfc3339_time',
    reference: rfc3339Time,
    async: false,
    expects: null,
    requirement: RFC_3339_TIME_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'time', dataset, config);
      }
      return dataset;
    },
  };
}