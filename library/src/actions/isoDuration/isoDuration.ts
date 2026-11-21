import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * The ISO 8601 / RFC 3339 duration regex. Matches strings like `P1D`,
 * `PT5H30M`, `P1Y2M3DT4H5M6S`, with optional decimal values. A bare `P` or `PT`
 * (no components) is rejected. See issue #1497.
 */
const ISO_DURATION_REGEX: RegExp =
  /^P(?!T?$)(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/**
 * ISO duration issue interface.
 */
export interface IsoDurationIssue<TInput extends string>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'iso_duration';
  readonly expected: null;
  readonly received: `"${string}"`;
  readonly requirement: RegExp;
}

/**
 * ISO duration action interface.
 */
export interface IsoDurationAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoDurationIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoDurationIssue<TInput>> {
  readonly type: 'iso_duration';
  readonly reference: typeof isoDuration;
  readonly expects: null;
  readonly requirement: RegExp;
  readonly message: TMessage;
}

/**
 * Creates an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) /
 * [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) duration validation action.
 *
 * Format: `P[n]Y[n]M[n]W[n]DT[n]H[n]M[n]S` (e.g. `P1D`, `PT5H30M`,
 * `P1Y2M3DT4H5M6S`). Decimal values are supported. A bare `P` or `PT` with no
 * components is rejected. See issue #1497.
 *
 * @returns An ISO duration action.
 */
export function isoDuration<TInput extends string>(): IsoDurationAction<
  TInput,
  undefined
>;

/**
 * Creates an ISO duration validation action.
 *
 * @param message The error message.
 *
 * @returns An ISO duration action.
 */
export function isoDuration<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoDurationIssue<TInput>> | undefined,
>(message: TMessage): IsoDurationAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoDuration(
  message?: ErrorMessage<IsoDurationIssue<string>>,
): IsoDurationAction<string, ErrorMessage<IsoDurationIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'iso_duration',
    reference: isoDuration,
    async: false,
    expects: null,
    requirement: ISO_DURATION_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'duration', dataset, config);
      }
      return dataset;
    },
  };
}