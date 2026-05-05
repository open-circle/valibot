import { describe, expect, test } from 'vitest';
import { ISO_WEEK_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import {
  isoWeek,
  type IsoWeekIssue as IsoWeek,
  type IsoWeekAction,
} from './isoWeek.ts';

describe('isoWeek', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsoWeekAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iso_week',
      reference: isoWeek,
      expects: null,
      requirement: ISO_WEEK_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsoWeekAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isoWeek()).toStrictEqual(action);
      expect(isoWeek(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isoWeek('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsoWeekAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isoWeek(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsoWeekAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isoWeek();

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

    test('for valid ISO date times', () => {
      expectNoActionIssue(action, ['0000-W01', '2023-W29', '9999-W53']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoWeek('message');
    const baseIssue: Omit<IsoWeek<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'iso_week',
      expected: null,
      message: 'message',
      requirement: ISO_WEEK_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 0000-W01',
        '0000-W01 ',
        ' 0000-W01 ',
      ]);
    });

    test('for missing separators', () => {
      expectActionIssue(action, baseIssue, ['0000-01', '0000W01', '000001']);
    });

    test('for wrong separators', () => {
      expectActionIssue(action, baseIssue, [
        '0000- 01',
        '0000-A01',
        '0000-Z01',
        '0000-w01',
        '0000.W01',
        '0000–W01',
        '0000 W01',
        '0000/W01',
        '0000_W01',
      ]);
    });

    test('for invalid year', () => {
      expectActionIssue(action, baseIssue, [
        '-W01', // missing digits
        '0-W01', // 1 digit
        '00-W01', // 2 digit
        '000-W01', // 3 digits
        '00000-W01', // 5 digits
      ]);
    });

    test('for invalid weeks', () => {
      expectActionIssue(action, baseIssue, [
        '0000-W', // missing digits
        '0000-W0', // 1 digit
        '0000-W000', // 3 digits
        '0000-W00', // 00
        '0000-W54', // 54
        '0000-W99', // 99
      ]);
    });
  });
});
