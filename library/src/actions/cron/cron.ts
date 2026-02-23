import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

// =====================
// Branded Type
// =====================

/**
 * Cron brand symbol. Kept unexported to prevent external forgery.
 */
const cronBrand: unique symbol = Symbol();

/**
 * A branded string type representing a validated cron expression.
 * Can only be obtained via {@link cron} action or {@link buildCron}.
 */
export type CronExpression = string & { readonly [cronBrand]: unknown };

// =====================
// Template Literal Types
// =====================

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type OneToNine = Exclude<Digit, '0'>;
type OneToFive = '1' | '2' | '3' | '4' | '5';

type CronFieldValue<T extends string> =
  | '*'
  | `*/${string}`
  | T
  | `${T}-${string}`
  | `${T},${string}`;

/**
 * Minute field type (0-59).
 */
export type MinuteField = CronFieldValue<Digit | `${OneToFive}${Digit}`>;

/**
 * Hour field type (0-23).
 */
export type HourField = CronFieldValue<
  Digit | `1${Digit}` | `2${'0' | '1' | '2' | '3'}`
>;

/**
 * Day of month field type (1-31).
 */
export type DayField = CronFieldValue<
  OneToNine | `1${Digit}` | `2${Digit}` | '30' | '31'
>;

/**
 * Month field type (1-12).
 */
export type MonthField = CronFieldValue<OneToNine | '10' | '11' | '12'>;

/**
 * Day of week field type (0-6).
 */
export type WeekdayField = CronFieldValue<
  '0' | '1' | '2' | '3' | '4' | '5' | '6'
>;

/**
 * Cron fields interface for use with {@link buildCron}.
 */
export interface CronFields {
  readonly minute: MinuteField;
  readonly hour: HourField;
  readonly day: DayField;
  readonly month: MonthField;
  readonly weekday: WeekdayField;
}

// =====================
// Valibot Action Types
// =====================

/**
 * Cron issue interface.
 */
export interface CronIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'cron';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
}

/**
 * Cron action interface.
 */
export interface CronAction<
  TInput extends string,
  TMessage extends ErrorMessage<CronIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, CronIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'cron';
  /**
   * The action reference.
   */
  readonly reference: typeof cron;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

// =====================
// Field Pattern
// =====================

/**
 * Cron field pattern regex.
 * Matches: * | *\/N | N | N-M | N\/S | N,M,...
 */
const CRON_FIELD_PATTERN = /^(?:\*(?:\/\d+)?|\d+(?:[-,/]\d+)*)$/u;

// =====================
// Helper Functions
// =====================

/**
 * Validates a string as a cron expression at runtime.
 * Splits into 5 fields and checks each against {@link CRON_FIELD_PATTERN}.
 *
 * @param input The string to validate.
 *
 * @returns Whether the input is a valid cron expression.
 */
function _isCron(input: string): boolean {
  const fields = input.split(' ');
  return fields.length === 5 && fields.every((f) => CRON_FIELD_PATTERN.test(f));
}

/**
 * Builds a {@link CronExpression} from statically typed fields.
 *
 * Use this when you want compile-time type checking on each field.
 * For runtime string validation, use the {@link cron} action instead.
 *
 * @param fields The cron fields.
 *
 * @returns A {@link CronExpression}.
 */
export function buildCron(fields: CronFields): CronExpression {
  const expr = `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;
  return expr as CronExpression;
}

// =====================
// Action Function
// =====================

/**
 * Creates a [cron expression](https://en.wikipedia.org/wiki/Cron) validation action.
 *
 * @returns A cron action.
 *
 * @beta
 */
export function cron<TInput extends string>(): CronAction<TInput, undefined>;

/**
 * Creates a [cron expression](https://en.wikipedia.org/wiki/Cron) validation action.
 *
 * @param message The error message.
 *
 * @returns A cron action.
 *
 * @beta
 */
export function cron<
  TInput extends string,
  const TMessage extends ErrorMessage<CronIssue<TInput>> | undefined,
>(message: TMessage): CronAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function cron(
  message?: ErrorMessage<CronIssue<string>>
): CronAction<string, ErrorMessage<CronIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'cron',
    reference: cron,
    async: false,
    expects: null,
    requirement: _isCron,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'cron expression', dataset, config);
      }
      return dataset;
    },
  };
}
