import { describe, expect, test } from 'vitest';
import { flatten } from '../../methods/flatten/index.ts';
import { pipe } from '../../methods/pipe/index.ts';
import { safeParse } from '../../methods/safeParse/index.ts';
import { string, type StringIssue } from '../../schemas/index.ts';
import { expectNoActionIssue } from '../../vitest/index.ts';
import { cron, type CronAction, type CronDialect } from './cron.ts';

describe('cron', () => {
  describe('should return action object', () => {
    const baseAction: Omit<CronAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'cron',
      reference: cron,
      expects: null,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: CronAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(cron()).toStrictEqual(action);
      expect(cron(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(cron('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies CronAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(cron(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CronAction<string, typeof message>);
    });
  });

  describe('untyped input', () => {
    const action = cron();

    test('returns dataset unchanged', () => {
      const issues: [StringIssue] = [
        {
          kind: 'schema',
          type: 'string',
          input: null,
          expected: 'string',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });
  });

  describe('VIXIE (default dialect)', () => {
    const action = cron();

    describe('valid', () => {
      test('wildcard', () => {
        expectNoActionIssue(action, ['* * * * *']);
      });

      test('specific values', () => {
        expectNoActionIssue(action, [
          '0 0 1 1 0',
          '59 23 31 12 6',
          '30 6 15 6 3',
        ]);
      });

      test('step expressions', () => {
        expectNoActionIssue(action, [
          '*/5 * * * *',
          '*/15 */6 * * *',
          '0 */2 * * *',
        ]);
      });

      test('range expressions', () => {
        expectNoActionIssue(action, [
          '0-30 * * * *',
          '30 6 * * 1-5',
          '0 9-17 * * 1-5',
        ]);
      });

      test('list expressions', () => {
        expectNoActionIssue(action, [
          '0,30 * * * *',
          '0 0 1,15 * *',
          '0 8,12,17 * * 1-5',
        ]);
      });

      test('combined expressions', () => {
        expectNoActionIssue(action, ['0-30/5 * * * *', '0 0 * 1,6,12 *']);
      });

      test('tolerates extra whitespace between fields and around input', () => {
        expectNoActionIssue(action, [
          '0  0 * * *',
          '0\t0\t*\t*\t*',
          ' 0 0 * * *',
          '0 0 * * * ',
          '  @hourly  ',
          ' @reboot ',
        ]);
      });
    });

    describe('invalid', () => {
      function runDefault(value: string) {
        return action['~run']({ typed: true, value }, {});
      }

      test('empty / whitespace-only strings', () => {
        for (const value of ['', ' ', '\n']) {
          expect(runDefault(value).issues).toBeDefined();
        }
      });

      test('wrong field count emits a single field-count issue without path', () => {
        for (const value of ['* * *', '* * * *', '* * * * * *']) {
          const result = runDefault(value);
          expect(result.issues).toHaveLength(1);
          expect(result.issues?.[0].path).toBeUndefined();
        }
      });

      test('out-of-range values emit field-level issues with path', () => {
        const cases: { value: string; field: string }[] = [
          { value: '60 0 1 1 0', field: 'minute' },
          { value: '0 24 1 1 0', field: 'hour' },
          { value: '0 0 0 1 0', field: 'day' },
          { value: '0 0 32 1 0', field: 'day' },
          { value: '0 0 1 0 0', field: 'month' },
          { value: '0 0 1 13 0', field: 'month' },
          { value: '0 0 1 1 7', field: 'weekday' },
        ];
        for (const { value, field } of cases) {
          const result = runDefault(value);
          expect(result.issues).toHaveLength(1);
          expect(result.issues?.[0].path?.[0]).toMatchObject({
            type: 'object',
            origin: 'value',
            key: field,
          });
        }
      });

      test('multiple out-of-range fields emit multiple issues', () => {
        const result = runDefault('99 25 32 13 8');
        expect(result.issues).toHaveLength(5);
        const keys = result.issues?.map((i) => i.path?.[0].key);
        expect(keys).toEqual(['minute', 'hour', 'day', 'month', 'weekday']);
      });

      test('invalid syntax', () => {
        for (const value of [
          'abc * * * *',
          '* * * * MON', // names not supported in VIXIE
          '? * * * *', // ? not supported in VIXIE
          '30-10 * * * *', // from > to
          '1-2-3 * * * *',
          '1- * * * *',
          '*/0 * * * *',
          '1/2/3 * * * *',
          '1, * * * *',
        ]) {
          expect(runDefault(value).issues).toBeDefined();
        }
      });

      test('step accepts up to field range size, rejects above', () => {
        // minute: range size 60
        expect(runDefault('*/60 * * * *').issues).toBeUndefined();
        expect(runDefault('*/61 * * * *').issues).toBeDefined();
        // hour: range size 24
        expect(runDefault('* */24 * * *').issues).toBeUndefined();
        expect(runDefault('* */25 * * *').issues).toBeDefined();
        // day: range size 31
        expect(runDefault('* * */31 * *').issues).toBeUndefined();
        expect(runDefault('* * */32 * *').issues).toBeDefined();
        // month: range size 12
        expect(runDefault('* * * */12 *').issues).toBeUndefined();
        expect(runDefault('* * * */13 *').issues).toBeDefined();
        // weekday: range size 7 (0-6)
        expect(runDefault('* * * * */7').issues).toBeUndefined();
        expect(runDefault('* * * * */8').issues).toBeDefined();
      });

      test('step within a sub-range still subject to step upper bound', () => {
        expect(runDefault('0-30/60 * * * *').issues).toBeUndefined();
        expect(runDefault('0-30/61 * * * *').issues).toBeDefined();
      });

      test('accepts the eight Vixie special strings', () => {
        for (const value of [
          '@reboot',
          '@yearly',
          '@annually',
          '@monthly',
          '@weekly',
          '@daily',
          '@midnight',
          '@hourly',
        ]) {
          expect(runDefault(value).issues).toBeUndefined();
        }
      });

      test('special strings are matched case-insensitively', () => {
        expect(runDefault('@HOURLY').issues).toBeUndefined();
        expect(runDefault('@Reboot').issues).toBeUndefined();
      });

      test('rejects unknown @-prefixed strings', () => {
        for (const value of ['@nope', '@', '@unknown', '@hourly extra']) {
          expect(runDefault(value).issues).toBeDefined();
        }
      });

      test('accepts ~ random-value operator in all forms', () => {
        // Standalone ~
        expect(runDefault('~ * * * *').issues).toBeUndefined();
        expect(runDefault('* * * * ~').issues).toBeUndefined();
        // N~M, ~M, N~
        expect(runDefault('0~30 * * * *').issues).toBeUndefined();
        expect(runDefault('~30 * * * *').issues).toBeUndefined();
        expect(runDefault('0~ * * * *').issues).toBeUndefined();
        // ~ with step
        expect(runDefault('~/5 * * * *').issues).toBeUndefined();
        expect(runDefault('0~30/5 * * * *').issues).toBeUndefined();
      });

      test('rejects ~ with out-of-range bounds or malformed forms', () => {
        expect(runDefault('0~60 * * * *').issues).toBeDefined(); // 60 > minute max
        expect(runDefault('~~30 * * * *').issues).toBeDefined();
        expect(runDefault('0~30~ * * * *').issues).toBeDefined();
        expect(runDefault('30~0 * * * *').issues).toBeDefined(); // from > to
      });

      test(', lists tilde forms and numeric items together', () => {
        expect(runDefault('0,~30,45 * * * *').issues).toBeUndefined();
        expect(runDefault('~,30 * * * *').issues).toBeUndefined();
      });

      test(', rejects empty items (leading / trailing / consecutive)', () => {
        expect(runDefault(',1 * * * *').issues).toBeDefined();
        expect(runDefault('1, * * * *').issues).toBeDefined();
        expect(runDefault('1,,3 * * * *').issues).toBeDefined();
      });

      test('nicknames and literals are whole-expression only, not list items', () => {
        expect(runDefault('@hourly,@daily').issues).toBeDefined();
        expect(runDefault('@reboot,@hourly').issues).toBeDefined();
      });

      test('numeric values are range-checked in every field of every dialect', () => {
        // POSIX / VIXIE share the same 5 ranges
        expect(runDefault('60 0 1 1 0').issues).toBeDefined(); // minute > 59
        // NODE_CRON: second 0-59
        expect(
          action['~run'](
            { typed: true, value: '60 0 0 1 1 0' },
            { cronDialect: 'NODE_CRON' }
          ).issues
        ).toBeDefined();
        // NODE_SCHEDULE: second 0-59
        expect(
          action['~run'](
            { typed: true, value: '60 0 0 1 1 0' },
            { cronDialect: 'NODE_SCHEDULE' }
          ).issues
        ).toBeDefined();
        // Croner: second 0-59
        expect(
          action['~run'](
            { typed: true, value: '60 0 0 1 1 0' },
            { cronDialect: 'Croner' }
          ).issues
        ).toBeDefined();
        // Croner: year 1-9999 covered in dialect block above
      });
    });
  });

  describe('POSIX dialect (strict)', () => {
    const action = cron();
    function runPosix(value: string) {
      return action['~run']({ typed: true, value }, { cronDialect: 'POSIX' });
    }

    test('accepts wildcard, list, range', () => {
      for (const value of [
        '* * * * *',
        '0 0 1 1 0',
        '0-30 * * * *',
        '0,15,30,45 * * * *',
      ]) {
        expect(runPosix(value).issues).toBeUndefined();
      }
    });

    test('rejects step (/) — not part of POSIX spec', () => {
      for (const value of ['*/5 * * * *', '0-30/5 * * * *', '0 */2 * * *']) {
        const result = runPosix(value);
        expect(result.issues).toBeDefined();
      }
    });

    test('rejects names, nicknames, ?, ~, @reboot', () => {
      for (const value of [
        '0 0 1 JAN MON',
        '@hourly',
        '@reboot',
        '? * * * *',
        '~ * * * *',
      ]) {
        expect(runPosix(value).issues).toBeDefined();
      }
    });
  });

  describe('NODE_CRON dialect', () => {
    const action = cron();
    function runNodeCron(value: string) {
      return action['~run'](
        { typed: true, value },
        { cronDialect: 'NODE_CRON' }
      );
    }

    test('accepts 5 fields (second omitted)', () => {
      expect(runNodeCron('* * * * *').issues).toBeUndefined();
      expect(runNodeCron('0 12 * * 1-5').issues).toBeUndefined();
    });

    test('accepts 6 fields with leading second', () => {
      expect(runNodeCron('0 * * * * *').issues).toBeUndefined();
      expect(runNodeCron('30 0 12 * * 1-5').issues).toBeUndefined();
    });

    test('accepts month and weekday names case-insensitively', () => {
      expect(runNodeCron('0 0 1 JAN MON').issues).toBeUndefined();
      expect(runNodeCron('0 0 1 jan mon').issues).toBeUndefined();
      expect(runNodeCron('0 0 1 DEC FRI').issues).toBeUndefined();
    });

    test('accepts weekday 7 as Sunday', () => {
      expect(runNodeCron('0 0 * * 7').issues).toBeUndefined();
    });

    test('rejects 4-field and 7-field expressions', () => {
      expect(runNodeCron('* * * *').issues).toBeDefined();
      expect(runNodeCron('* * * * * * *').issues).toBeDefined();
    });

    test('rejects ? (not supported by node-cron)', () => {
      expect(runNodeCron('? * * * *').issues).toBeDefined();
    });
  });

  describe('NODE_SCHEDULE dialect', () => {
    const action = cron();
    function runNodeSchedule(value: string) {
      return action['~run'](
        { typed: true, value },
        { cronDialect: 'NODE_SCHEDULE' }
      );
    }

    test('accepts 5 or 6 fields', () => {
      expect(runNodeSchedule('* * * * *').issues).toBeUndefined();
      expect(runNodeSchedule('0 * * * * *').issues).toBeUndefined();
    });

    test('accepts ? as wildcard alias', () => {
      expect(runNodeSchedule('0 17 ? * 0,4-6').issues).toBeUndefined();
      expect(runNodeSchedule('? ? ? ? ?').issues).toBeUndefined();
    });

    test('accepts # (nth weekday)', () => {
      expect(runNodeSchedule('0 0 * * 5#2').issues).toBeUndefined();
      expect(runNodeSchedule('0 0 * * MON#1').issues).toBeUndefined();
    });

    test('accepts , lists of # forms', () => {
      expect(runNodeSchedule('0 0 * * MON#1,FRI#2').issues).toBeUndefined();
      expect(runNodeSchedule('0 0 * * 1#1,5#2').issues).toBeUndefined();
    });

    test('rejects L and W (explicitly unsupported by node-schedule)', () => {
      expect(runNodeSchedule('0 0 L * *').issues).toBeDefined();
      expect(runNodeSchedule('0 0 15W * *').issues).toBeDefined();
    });
  });

  describe('Croner dialect', () => {
    const action = cron();
    function runCroner(value: string) {
      return action['~run']({ typed: true, value }, { cronDialect: 'Croner' });
    }

    test('accepts 6 fields', () => {
      expect(runCroner('0 0 0 1 1 0').issues).toBeUndefined();
      expect(runCroner('* * * * * *').issues).toBeUndefined();
    });

    test('accepts 7 fields with year', () => {
      expect(runCroner('0 0 0 1 1 0 2025').issues).toBeUndefined();
      expect(runCroner('* * * * * * *').issues).toBeUndefined();
    });

    test('rejects 5-field expressions', () => {
      expect(runCroner('* * * * *').issues).toBeDefined();
    });

    test('accepts month and weekday names case-insensitively', () => {
      expect(runCroner('0 0 0 1 JAN MON').issues).toBeUndefined();
      expect(runCroner('0 0 0 1 jan sun').issues).toBeUndefined();
    });

    test('accepts day-of-month L and NW', () => {
      expect(runCroner('0 0 0 L * *').issues).toBeUndefined();
      expect(runCroner('0 0 0 15W * *').issues).toBeUndefined();
      expect(runCroner('0 0 0 1W * *').issues).toBeUndefined();
    });

    test('accepts , lists mixing day-of-month special values', () => {
      expect(runCroner('0 0 0 1,15,L * *').issues).toBeUndefined();
      expect(runCroner('0 0 0 1,15W * *').issues).toBeUndefined();
      expect(runCroner('0 0 0 L,15W * *').issues).toBeUndefined();
    });

    test('rejects step combined with day-of-month special values', () => {
      expect(runCroner('0 0 0 L/2 * *').issues).toBeDefined();
      expect(runCroner('0 0 0 15W/2 * *').issues).toBeDefined();
    });

    test('accepts weekday # (nth and last)', () => {
      expect(runCroner('0 0 0 * * 5#2').issues).toBeUndefined();
      expect(runCroner('0 0 0 * * FRI#L').issues).toBeUndefined();
      expect(runCroner('0 0 0 * * MON#1').issues).toBeUndefined();
    });

    test('accepts , lists of weekday # forms', () => {
      expect(runCroner('0 0 0 * * FRI#1,MON#2').issues).toBeUndefined();
      expect(runCroner('0 0 0 * * 5#2,1#L').issues).toBeUndefined();
    });

    test('accepts + prefix for weekday (AND logic)', () => {
      expect(runCroner('0 0 0 1 * +MON').issues).toBeUndefined();
      expect(runCroner('0 0 20 1 * +MON 2030').issues).toBeUndefined();
    });

    test('accepts nicknames', () => {
      for (const nick of [
        '@yearly',
        '@annually',
        '@monthly',
        '@weekly',
        '@daily',
        '@midnight',
        '@hourly',
      ]) {
        expect(runCroner(nick).issues).toBeUndefined();
      }
    });

    test('accepts ? wildcard alias', () => {
      expect(runCroner('? ? ? ? ? ?').issues).toBeUndefined();
    });

    test('accepts year range 1-9999', () => {
      expect(runCroner('* * * * * * 1').issues).toBeUndefined();
      expect(runCroner('* * * * * * 9999').issues).toBeUndefined();
      expect(runCroner('* * * * * * 0').issues).toBeDefined();
      expect(runCroner('* * * * * * 10000').issues).toBeDefined();
    });
  });

  describe('field-level issue path', () => {
    const action = cron();

    test('issue input is the failing field value, dataset value is unchanged', () => {
      const result = action['~run']({ typed: true, value: '60 0 1 1 0' }, {});
      expect(result.value).toBe('60 0 1 1 0');
      expect(result.issues?.[0].input).toBe('60');
      expect(result.issues?.[0].received).toBe('"60"');
    });

    test('path object input contains parsed cron fields', () => {
      const result = action['~run']({ typed: true, value: '60 0 1 1 0' }, {});
      const pathItem = result.issues?.[0].path?.[0];
      expect(pathItem?.input).toEqual({
        minute: '60',
        hour: '0',
        day: '1',
        month: '1',
        weekday: '0',
      });
    });

    test('path[0] keys appear in field order for VIXIE (5 fields)', () => {
      const result = action['~run'](
        { typed: true, value: '60 24 32 13 8' },
        {}
      );
      expect(result.issues).toHaveLength(5);
      expect(result.issues?.map((i) => i.path?.[0].key)).toEqual([
        'minute',
        'hour',
        'day',
        'month',
        'weekday',
      ]);
    });

    test('path[0] keys appear in field order for NODE_CRON (6 fields)', () => {
      const result = action['~run'](
        { typed: true, value: '60 60 24 32 13 8' },
        { cronDialect: 'NODE_CRON' }
      );
      expect(result.issues).toHaveLength(6);
      expect(result.issues?.map((i) => i.path?.[0].key)).toEqual([
        'second',
        'minute',
        'hour',
        'day',
        'month',
        'weekday',
      ]);
    });

    test('path[0] keys appear in field order for Croner (7 fields)', () => {
      const result = action['~run'](
        { typed: true, value: '60 60 24 32 13 8 0' },
        { cronDialect: 'Croner' }
      );
      expect(result.issues).toHaveLength(7);
      expect(result.issues?.map((i) => i.path?.[0].key)).toEqual([
        'second',
        'minute',
        'hour',
        'day',
        'month',
        'weekday',
        'year',
      ]);
    });

    test('flatten(issues) groups field-level issues under "nested" with exact messages', () => {
      const result = safeParse(pipe(string(), cron()), '60 0 32 13 8');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(flatten(result.issues)).toEqual({
          nested: {
            minute: ['Invalid cron expression: Received "60"'],
            day: ['Invalid cron expression: Received "32"'],
            month: ['Invalid cron expression: Received "13"'],
            weekday: ['Invalid cron expression: Received "8"'],
          },
        });
      }
    });

    test('flatten(issues) places wrong-field-count issue under "root"', () => {
      const result = safeParse(pipe(string(), cron()), '* * *');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(flatten(result.issues)).toEqual({
          root: ['Invalid cron expression: Received "* * *"'],
        });
      }
    });
  });

  describe('CronDialect type', () => {
    test('union covers all five built-in dialects', () => {
      const dialects: CronDialect[] = [
        'POSIX',
        'VIXIE',
        'NODE_CRON',
        'NODE_SCHEDULE',
        'Croner',
      ];
      expect(dialects).toHaveLength(5);
    });
  });
});
