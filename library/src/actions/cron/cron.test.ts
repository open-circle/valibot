import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { cron, type CronAction, type CronIssue } from './cron.ts';

describe('cron', () => {
  describe('should return action object', () => {
    const baseAction: Omit<CronAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'cron',
      reference: cron,
      expects: null,
      requirement: expect.any(Function),
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

  describe('should return dataset without issues', () => {
    const action = cron();

    test('for untyped inputs', () => {
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

    test('for wildcard expressions', () => {
      expectNoActionIssue(action, ['* * * * *']);
    });

    test('for specific values', () => {
      expectNoActionIssue(action, [
        '0 0 1 1 0',
        '59 23 31 12 6',
        '30 6 15 6 3',
      ]);
    });

    test('for step expressions', () => {
      expectNoActionIssue(action, [
        '*/5 * * * *',
        '*/15 */6 * * *',
        '0 */2 * * *',
      ]);
    });

    test('for range expressions', () => {
      expectNoActionIssue(action, [
        '0-30 * * * *',
        '30 6 * * 1-5',
        '0 9-17 * * 1-5',
      ]);
    });

    test('for list expressions', () => {
      expectNoActionIssue(action, [
        '0,30 * * * *',
        '0 0 1,15 * *',
        '0 8,12,17 * * 1-5',
      ]);
    });

    test('for combined expressions', () => {
      expectNoActionIssue(action, [
        '0-30/5 * * * *',
        '0 0 * 1,6,12 *',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = cron('message');
    const baseIssue: Omit<CronIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'cron',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for wrong number of fields', () => {
      expectActionIssue(action, baseIssue, [
        '* * *',       // too few
        '* * * *',     // too few
        '* * * * * *', // too many
      ]);
    });

    test('for invalid characters', () => {
      expectActionIssue(action, baseIssue, [
        'abc * * * *',
        '* * * * MON',
        '? * * * *',
      ]);
    });

    test('for invalid separators', () => {
      expectActionIssue(action, baseIssue, [
        '* * * * *\t', // tab instead of space
        '***** ',      // no spaces
      ]);
    });

    test('for out-of-range values', () => {
      expectActionIssue(action, baseIssue, [
        '60 0 1 1 0',    // minute > 59
        '0 24 1 1 0',    // hour > 23
        '0 0 0 1 0',     // day < 1
        '0 0 32 1 0',    // day > 31
        '0 0 1 0 0',     // month < 1
        '0 0 1 13 0',    // month > 12
        '0 0 1 1 7',     // weekday > 6
        '99 25 32 13 8', // all out of range
      ]);
    });

    test('for invalid ranges', () => {
      expectActionIssue(action, baseIssue, [
        '30-10 * * * *', // from > to
        '0 20-10 * * *', // from > to
        '1-2-3 * * * *', // multiple range operators
        '1- * * * *',    // trailing dash
      ]);
    });

    test('for invalid step values', () => {
      expectActionIssue(action, baseIssue, [
        '*/0 * * * *',   // step must be >= 1
        '0 */0 * * *',   // step must be >= 1
        '1/2/3 * * * *', // multiple step operators
      ]);
    });

    test('for trailing operators', () => {
      expectActionIssue(action, baseIssue, [
        '1, * * * *', // trailing comma
        '0,30, * * * *', // trailing comma in list
      ]);
    });
  });
});
