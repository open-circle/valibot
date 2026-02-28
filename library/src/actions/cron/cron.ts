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
 * Cron brand symbol.
 *
 * This symbol is kept unexported so that, at the type level, only this module
 * can create values of type {@link CronExpression}. Note that this is a
 * TypeScript branding pattern and does not provide any runtime security or
 * cryptographic guarantee against forgery.
 */
const cronBrand: unique symbol = Symbol();

/**
 * A branded string type representing a cron expression.
 *
 * At compile time, this brand helps distinguish cron expressions from plain
 * strings and prevents many common mistakes when constructing or passing cron
 * expressions around.
 *
 * {@link CronExpression} values can only be created via the {@link cron}
 * action or {@link buildCron} helper. However, these helpers do not perform
 * full runtime validation of the underlying string, so a `CronExpression`
 * value is not a runtime guarantee that the string is a syntactically or
 * semantically valid cron expression.
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
// Field Ranges
// =====================

/**
 * Valid [min, max] value ranges for each cron field:
 * minute, hour, day-of-month, month, day-of-week.
 */
const CRON_FIELD_RANGES: readonly (readonly [number, number])[] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 6],
];

// =====================
// Helper Functions
// =====================

function _inRange(value: string, min: number, max: number): boolean {
  const n = parseInt(value, 10);
  return n >= min && n <= max;
}

/**
 * Validates one comma-separated item within a cron field.
 * Supports: *, *\/step, N, N-M, N\/step, N-M\/step
 *
 * @param item The item to validate.
 * @param min The minimum allowed value for this field.
 * @param max The maximum allowed value for this field.
 *
 * @returns Whether the item is valid.
 */
function _isValidCronItem(
  item: string,
  min: number,
  max: number
): boolean {
  const slashIndex = item.indexOf('/');
  let base: string;
  if (slashIndex !== -1) {
    const step = item.slice(slashIndex + 1);
    if (!/^\d+$/u.test(step) || parseInt(step, 10) < 1) return false;
    base = item.slice(0, slashIndex);
  } else {
    base = item;
  }

  if (base === '*') return true;

  const dashIndex = base.indexOf('-');
  if (dashIndex !== -1) {
    const from = base.slice(0, dashIndex);
    const to = base.slice(dashIndex + 1);
    return (
      /^\d+$/u.test(from) &&
      /^\d+$/u.test(to) &&
      _inRange(from, min, max) &&
      _inRange(to, min, max) &&
      parseInt(from, 10) <= parseInt(to, 10)
    );
  }

  return /^\d+$/u.test(base) && _inRange(base, min, max);
}

function _isValidCronField(field: string, min: number, max: number): boolean {
  if (field.length === 0) return false;
  return field.split(',').every((item) => _isValidCronItem(item, min, max));
}

/**
 * Validates a string as a cron expression at runtime.
 * Splits into 5 fields and checks each against its allowed value range.
 *
 * @param input The string to validate.
 *
 * @returns Whether the input is a valid cron expression.
 */
function _isCron(input: string): boolean {
  const fields = input.split(' ');
  return (
    fields.length === 5 &&
    fields.every((field, index) => {
      const [min, max] = CRON_FIELD_RANGES[index];
      return _isValidCronField(field, min, max);
    })
  );
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
