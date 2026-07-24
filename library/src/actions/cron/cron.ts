import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

declare module '../../types/config.ts' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Config<TIssue extends BaseIssue<unknown>> {
    /**
     * The cron dialect used by the `cron` action. Defaults to `'VIXIE'`.
     */
    readonly cronDialect?: CronDialect | undefined;
  }
}

interface CronFieldConfig {
  readonly range: readonly [number, number];
  readonly names?: Readonly<Record<string, number>>;
  readonly allowQuestionMark?: boolean;
  readonly specialPatterns?: readonly RegExp[];
  readonly allowedPrefixes?: readonly string[];
}

interface CronDialectConfig {
  readonly fields: readonly string[];
  readonly rules: Readonly<Record<string, CronFieldConfig>>;
  readonly optionalHeadFields?: number;
  readonly optionalTailFields?: number;
  readonly nicknames?: Readonly<Record<string, string>>;
  /**
   * Standalone tokens that are valid expressions on their own and do not
   * expand to a `M H D M W` form. E.g., Vixie `@reboot` fires at startup
   * and has no fixed schedule equivalent.
   */
  readonly literals?: readonly string[];
  readonly caseSensitive?: boolean;
  readonly allowStep?: boolean;
  /**
   * Whether `~` (tilde) is accepted as a random-value operator. OpenBSD
   * Vixie cron extension: `~` is a random value within the field's range;
   * `N~M`, `~M`, `N~` are ranges with optional bounds defaulting to the
   * field's min/max.
   */
  readonly allowTilde?: boolean;
}

interface CronDialectsRegistry {
  readonly POSIX: CronDialectConfig;
  readonly VIXIE: CronDialectConfig;
  readonly NODE_CRON: CronDialectConfig;
  readonly NODE_SCHEDULE: CronDialectConfig;
  readonly Croner: CronDialectConfig;
}

const MONTH_NAMES = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
} as const;

const WEEKDAY_NAMES = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
} as const;

const DAY_LAST_PATTERN = /^L$/u;
const DAY_NEAREST_WEEKDAY_PATTERN = /^([1-9]|[12]\d|3[01])W$/u;
const WEEKDAY_HASH_PATTERN = /^([0-7]|FRI|MON|SAT|SUN|THU|TUE|WED)#[1-5L]$/u;
const WEEKDAY_HASH_RANGE_PATTERN =
  /^([0-7]|FRI|MON|SAT|SUN|THU|TUE|WED)-([0-7]|FRI|MON|SAT|SUN|THU|TUE|WED)#[1-5L]$/u;

/**
 * Cron dialect registry.
 *
 * Each entry defines how a particular cron implementation parses an expression:
 * field count, per-field value ranges, named values, allowed operators,
 * special syntax, and any predefined nicknames. New dialects are added by
 * extending this registry; the public {@link CronDialect} type is derived
 * automatically from its keys.
 */
const CRON_DIALECTS: CronDialectsRegistry = {
  /**
   * Vixie cron (the de-facto cron on BSD and most Linux distributions),
   * matching the OpenBSD `crontab(5)` specification.
   *
   * Fields: `minute hour day-of-month month day-of-week` (5 fields).
   * Operators: `*`, `,`, `-`, `/`, `~` (random value, OpenBSD extension).
   * Eight special strings replace the 5 fields: `@reboot` (accepted
   * as-is, no schedule equivalent), `@yearly` / `@annually`, `@monthly`,
   * `@weekly`, `@daily` / `@midnight`, `@hourly`. Names are not
   * supported.
   *
   * @see https://man.openbsd.org/crontab.5
   */
  VIXIE: {
    fields: ['minute', 'hour', 'day', 'month', 'weekday'],
    rules: {
      minute: { range: [0, 59] },
      hour: { range: [0, 23] },
      day: { range: [1, 31] },
      month: { range: [1, 12] },
      weekday: { range: [0, 6] },
    },
    allowStep: true,
    allowTilde: true,
    nicknames: {
      '@yearly': '0 0 1 1 *',
      '@annually': '0 0 1 1 *',
      '@monthly': '0 0 1 * *',
      '@weekly': '0 0 * * 0',
      '@daily': '0 0 * * *',
      '@midnight': '0 0 * * *',
      '@hourly': '0 * * * *',
    },
    literals: ['@reboot'],
  },

  /**
   * Strict POSIX cron per IEEE Std 1003.1-2024.
   *
   * Fields: `minute hour day-of-month month day-of-week` (5 fields).
   * Operators: `*`, `,`, `-` only. The `/` (step) operator is NOT part of
   * the POSIX specification and is rejected by this dialect. Names,
   * nicknames, and special characters are not supported.
   *
   * @see https://pubs.opengroup.org/onlinepubs/9799919799/utilities/crontab.html
   */
  POSIX: {
    fields: ['minute', 'hour', 'day', 'month', 'weekday'],
    rules: {
      minute: { range: [0, 59] },
      hour: { range: [0, 23] },
      day: { range: [1, 31] },
      month: { range: [1, 12] },
      weekday: { range: [0, 6] },
    },
    allowStep: false,
  },

  /**
   * node-cron package syntax.
   *
   * Fields: `[second] minute hour day-of-month month day-of-week`
   * (5 or 6 fields; second is optional and leads the expression).
   * Operators: `*`, `,`, `-`, `/`. Month and weekday accept
   * case-insensitive names (`JAN`-`DEC`, `SUN`-`SAT`). Weekday range
   * is 0-7 where both 0 and 7 denote Sunday. No nicknames or special
   * characters.
   *
   * @see https://github.com/node-cron/node-cron
   */
  NODE_CRON: {
    fields: ['second', 'minute', 'hour', 'day', 'month', 'weekday'],
    optionalHeadFields: 1,
    rules: {
      second: { range: [0, 59] },
      minute: { range: [0, 59] },
      hour: { range: [0, 23] },
      day: { range: [1, 31] },
      month: { range: [1, 12], names: MONTH_NAMES },
      weekday: { range: [0, 7], names: WEEKDAY_NAMES },
    },
    allowStep: true,
    caseSensitive: false,
  },

  /**
   * node-schedule package syntax (parsed via cron-parser).
   *
   * Fields: `[second] minute hour day-of-month month day-of-week`
   * (5 or 6 fields; second is optional). Operators: `*`, `,`, `-`, `/`,
   * `?` (wildcard alias). Month and weekday accept case-insensitive
   * names. Weekday additionally supports `#` (nth weekday of month).
   * `L` and `W` are explicitly NOT supported by node-schedule.
   *
   * @see https://github.com/node-schedule/node-schedule
   */
  NODE_SCHEDULE: {
    fields: ['second', 'minute', 'hour', 'day', 'month', 'weekday'],
    optionalHeadFields: 1,
    rules: {
      second: { range: [0, 59], allowQuestionMark: true },
      minute: { range: [0, 59], allowQuestionMark: true },
      hour: { range: [0, 23], allowQuestionMark: true },
      day: { range: [1, 31], allowQuestionMark: true },
      month: { range: [1, 12], names: MONTH_NAMES, allowQuestionMark: true },
      weekday: {
        range: [0, 7],
        names: WEEKDAY_NAMES,
        allowQuestionMark: true,
        specialPatterns: [WEEKDAY_HASH_PATTERN],
      },
    },
    allowStep: true,
    caseSensitive: false,
  },

  /**
   * Croner library syntax.
   *
   * Fields: `second minute hour day-of-month month day-of-week [year]`
   * (6 or 7 fields; year is optional and trails the expression).
   * Operators: `*`, `,`, `-`, `/`, `?` (wildcard alias).
   * Month and weekday accept case-insensitive names. Day-of-month
   * supports `L` (last day) and `NW` (nearest weekday). Day-of-week
   * supports `#` (nth weekday or last weekday) and `+` prefix (AND
   * logic with day-of-month). Nicknames `@yearly`, `@annually`,
   * `@monthly`, `@weekly`, `@daily`, `@midnight`, `@hourly` are
   * expanded before validation.
   *
   * Validation is purely syntactic; semantic correctness such as whether
   * a `15W` date actually exists in a given month is not checked. Date
   * objects, ISO 8601 inputs, and the `alternativeWeekdays` runtime
   * option of Croner are out of scope for this dialect.
   *
   * @see https://github.com/Hexagon/croner
   */
  Croner: {
    fields: ['second', 'minute', 'hour', 'day', 'month', 'weekday', 'year'],
    optionalTailFields: 1,
    rules: {
      second: { range: [0, 59], allowQuestionMark: true },
      minute: { range: [0, 59], allowQuestionMark: true },
      hour: { range: [0, 23], allowQuestionMark: true },
      day: {
        range: [1, 31],
        allowQuestionMark: true,
        specialPatterns: [DAY_LAST_PATTERN, DAY_NEAREST_WEEKDAY_PATTERN],
      },
      month: { range: [1, 12], names: MONTH_NAMES, allowQuestionMark: true },
      weekday: {
        range: [0, 7],
        names: WEEKDAY_NAMES,
        allowQuestionMark: true,
        specialPatterns: [WEEKDAY_HASH_PATTERN, WEEKDAY_HASH_RANGE_PATTERN],
        allowedPrefixes: ['+'],
      },
      year: { range: [1, 9999], allowQuestionMark: true },
    },
    allowStep: true,
    caseSensitive: false,
    nicknames: {
      '@yearly': '0 0 0 1 1 *',
      '@annually': '0 0 0 1 1 *',
      '@monthly': '0 0 0 1 * *',
      '@weekly': '0 0 0 * * 0',
      '@daily': '0 0 0 * * *',
      '@midnight': '0 0 0 * * *',
      '@hourly': '0 0 * * * *',
    },
  },
};

/**
 * Supported cron dialect identifier.
 *
 * Derived from the keys of the internal dialect registry. Set via the
 * `cronDialect` config option passed to `parse`, `safeParse`, etc.
 */
export type CronDialect = keyof CronDialectsRegistry;

const DEFAULT_DIALECT: CronDialect = 'VIXIE';

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
   * The error message.
   */
  readonly message: TMessage;
}

function _resolveValue(token: string, field: CronFieldConfig): number | null {
  if (/^\d+$/u.test(token)) return parseInt(token, 10);
  if (field.names && Object.prototype.hasOwnProperty.call(field.names, token)) {
    return field.names[token];
  }
  return null;
}

function _isValidCronItem(
  item: string,
  field: CronFieldConfig,
  dialect: CronDialectConfig
): boolean {
  if (item === '') return false;

  if (field.allowQuestionMark && item === '?') return true;

  // Special patterns (e.g. `L`, `15W`, `FRI#1`) are matched per item so
  // they compose with `,` lists like `1,15,L` or `FRI#1,MON#2`. The
  // patterns are anchored at both ends, so a token like `15W/2` does
  // not match and the step branch below runs (and rejects it).
  if (field.specialPatterns) {
    for (const pattern of field.specialPatterns) {
      if (pattern.test(item)) return true;
    }
  }

  let base = item;
  const slashIndex = item.indexOf('/');
  if (slashIndex !== -1) {
    if (!dialect.allowStep) return false;
    const step = item.slice(slashIndex + 1);
    if (!/^\d+$/u.test(step)) return false;
    const stepNum = parseInt(step, 10);
    const [min, max] = field.range;
    // Step must be at least 1 and at most the field's range size. A step
    // greater than the range size is meaningless (it can never fire more
    // than once across the field's value space) and almost always a typo.
    if (stepNum < 1 || stepNum > max - min + 1) return false;
    base = item.slice(0, slashIndex);
    if (base.includes('/')) return false;
  }

  if (base === '*') return true;

  // Tilde forms (OpenBSD Vixie extension): `~`, `N~M`, `~M`, `N~`.
  // Either bound may be omitted and defaults to the field's min or max.
  if (dialect.allowTilde) {
    if (base === '~') return true;
    const firstTilde = base.indexOf('~');
    if (firstTilde !== -1) {
      if (base.indexOf('~', firstTilde + 1) !== -1) return false;
      const from = base.slice(0, firstTilde);
      const to = base.slice(firstTilde + 1);
      const [min, max] = field.range;
      const fromVal = from === '' ? min : _resolveValue(from, field);
      const toVal = to === '' ? max : _resolveValue(to, field);
      if (fromVal === null || toVal === null) return false;
      return fromVal >= min && toVal <= max && fromVal <= toVal;
    }
  }

  const dashIndex = base.indexOf('-');
  if (dashIndex !== -1) {
    const from = base.slice(0, dashIndex);
    const to = base.slice(dashIndex + 1);
    if (to.includes('-')) return false;
    const fromVal = _resolveValue(from, field);
    const toVal = _resolveValue(to, field);
    if (fromVal === null || toVal === null) return false;
    const [min, max] = field.range;
    return fromVal >= min && toVal <= max && fromVal <= toVal;
  }

  const value = _resolveValue(base, field);
  if (value === null) return false;
  const [min, max] = field.range;
  return value >= min && value <= max;
}

function _isValidCronField(
  rawValue: string,
  field: CronFieldConfig,
  dialect: CronDialectConfig
): boolean {
  if (rawValue === '') return false;

  let value = dialect.caseSensitive ? rawValue : rawValue.toUpperCase();

  if (field.allowedPrefixes) {
    for (const prefix of field.allowedPrefixes) {
      if (value.startsWith(prefix)) {
        value = value.slice(prefix.length);
        break;
      }
    }
  }

  return value
    .split(',')
    .every((item) => _isValidCronItem(item, field, dialect));
}

function _expandNickname(input: string, dialect: CronDialectConfig): string {
  if (!dialect.nicknames) return input;
  const lookup = dialect.caseSensitive ? input : input.toLowerCase();
  for (const [nick, expansion] of Object.entries(dialect.nicknames)) {
    const normalizedNick = dialect.caseSensitive ? nick : nick.toLowerCase();
    if (lookup === normalizedNick) return expansion;
  }
  return input;
}

/**
 * Creates a cron expression validation action.
 *
 * The grammar is selected via the `cronDialect` config option passed to
 * `parse` / `safeParse` (default: `'VIXIE'`). When a particular field
 * fails, the issue carries a path identifying which field of the
 * expression is invalid (e.g. `minute`, `weekday`), so
 * `flatten(issues, 'nested')` yields per-field error messages.
 *
 * Supported dialects:
 *
 * - `'VIXIE'` (default) — Vixie cron per the OpenBSD specification.
 *   5 fields, operators `*` `,` `-` `/` `~` (random value, OpenBSD
 *   extension). Eight special strings: `@reboot` plus the nicknames
 *   `@yearly` / `@annually` / `@monthly` / `@weekly` / `@daily` /
 *   `@midnight` / `@hourly`.
 *   {@link https://man.openbsd.org/crontab.5}
 *
 * - `'POSIX'` — Strict POSIX cron per IEEE Std 1003.1-2024. 5 fields,
 *   operators `*` `,` `-` only. No `/` step, no names, no nicknames.
 *   {@link https://pubs.opengroup.org/onlinepubs/9799919799/utilities/crontab.html}
 *
 * - `'NODE_CRON'` — node-cron package syntax. 5 or 6 fields (optional
 *   leading second), operators `*` `,` `-` `/`, case-insensitive month
 *   and weekday names, weekday range 0-7 (0 and 7 both = Sunday).
 *   {@link https://github.com/node-cron/node-cron}
 *
 * - `'NODE_SCHEDULE'` — node-schedule package syntax (via cron-parser).
 *   5 or 6 fields, operators `*` `,` `-` `/` `?`, names, weekday `#`
 *   (nth weekday). `L` and `W` are not supported by node-schedule.
 *   {@link https://github.com/node-schedule/node-schedule}
 *
 * - `'Croner'` — Croner library syntax. 6 or 7 fields (optional
 *   trailing year), operators `*` `,` `-` `/` `?`, names, day-of-month
 *   `L` and `NW`, day-of-week `#` and `+` prefix, plus the nicknames
 *   `@yearly` `@annually` `@monthly` `@weekly` `@daily` `@midnight`
 *   `@hourly`.
 *   {@link https://github.com/Hexagon/croner}
 *
 * @returns A cron action.
 *
 * @beta
 */
export function cron<TInput extends string>(): CronAction<TInput, undefined>;

/**
 * Creates a cron expression validation action.
 *
 * The grammar is selected via the `cronDialect` config option passed to
 * `parse` / `safeParse` (default: `'VIXIE'`). When a particular field
 * fails, the issue carries a path identifying which field of the
 * expression is invalid (e.g. `minute`, `weekday`), so
 * `flatten(issues, 'nested')` yields per-field error messages.
 *
 * Supported dialects:
 *
 * - `'VIXIE'` (default) — Vixie cron per the OpenBSD specification.
 *   5 fields, operators `*` `,` `-` `/` `~` (random value, OpenBSD
 *   extension). Eight special strings: `@reboot` plus the nicknames
 *   `@yearly` / `@annually` / `@monthly` / `@weekly` / `@daily` /
 *   `@midnight` / `@hourly`.
 *   {@link https://man.openbsd.org/crontab.5}
 *
 * - `'POSIX'` — Strict POSIX cron per IEEE Std 1003.1-2024. 5 fields,
 *   operators `*` `,` `-` only. No `/` step, no names, no nicknames.
 *   {@link https://pubs.opengroup.org/onlinepubs/9799919799/utilities/crontab.html}
 *
 * - `'NODE_CRON'` — node-cron package syntax. 5 or 6 fields (optional
 *   leading second), operators `*` `,` `-` `/`, case-insensitive month
 *   and weekday names, weekday range 0-7 (0 and 7 both = Sunday).
 *   {@link https://github.com/node-cron/node-cron}
 *
 * - `'NODE_SCHEDULE'` — node-schedule package syntax (via cron-parser).
 *   5 or 6 fields, operators `*` `,` `-` `/` `?`, names, weekday `#`
 *   (nth weekday). `L` and `W` are not supported by node-schedule.
 *   {@link https://github.com/node-schedule/node-schedule}
 *
 * - `'Croner'` — Croner library syntax. 6 or 7 fields (optional
 *   trailing year), operators `*` `,` `-` `/` `?`, names, day-of-month
 *   `L` and `NW`, day-of-week `#` and `+` prefix, plus the nicknames
 *   `@yearly` `@annually` `@monthly` `@weekly` `@daily` `@midnight`
 *   `@hourly`.
 *   {@link https://github.com/Hexagon/croner}
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
    message,
    '~run'(dataset, config) {
      if (!dataset.typed) return dataset;

      const dialectName: CronDialect = config.cronDialect ?? DEFAULT_DIALECT;
      const dialect = CRON_DIALECTS[dialectName];

      // Normalize whitespace before matching: surrounding whitespace is
      // ignored and any run of whitespace between fields counts as one
      // separator. This matches how Croner, node-cron and node-schedule
      // tokenize their inputs.
      const normalized = dataset.value.trim();

      // Standalone literals (e.g. Vixie `@reboot`) are valid without
      // expansion or field validation.
      if (dialect.literals) {
        const literalLookup = dialect.caseSensitive
          ? normalized
          : normalized.toLowerCase();
        for (const lit of dialect.literals) {
          const normalizedLit = dialect.caseSensitive ? lit : lit.toLowerCase();
          if (literalLookup === normalizedLit) return dataset;
        }
      }

      const expanded = _expandNickname(normalized, dialect);
      const tokens = expanded.split(/\s+/u);

      const totalFields = dialect.fields.length;
      const optHead = dialect.optionalHeadFields ?? 0;
      const optTail = dialect.optionalTailFields ?? 0;

      let fieldsToValidate: readonly string[];
      if (tokens.length === totalFields) {
        fieldsToValidate = dialect.fields;
      } else if (optHead > 0 && tokens.length === totalFields - optHead) {
        fieldsToValidate = dialect.fields.slice(optHead);
      } else if (optTail > 0 && tokens.length === totalFields - optTail) {
        fieldsToValidate = dialect.fields.slice(0, totalFields - optTail);
      } else {
        _addIssue(this, 'cron expression', dataset, config);
        return dataset;
      }

      const cronObject: Record<string, string> = {};
      for (let i = 0; i < fieldsToValidate.length; i++) {
        cronObject[fieldsToValidate[i]] = tokens[i];
      }

      for (const field of fieldsToValidate) {
        const value = cronObject[field];
        const fieldConfig = dialect.rules[field];
        if (!_isValidCronField(value, fieldConfig, dialect)) {
          _addIssue(this, 'cron expression', dataset, config, {
            input: value,
            path: [
              {
                type: 'object',
                origin: 'value',
                input: cronObject,
                key: field,
                value,
              },
            ],
          });
        }
      }

      return dataset;
    },
  };
}
