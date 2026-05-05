import { describe, expect, test } from 'vitest';
import { ISO_DATE_TIME_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import {
  isoDateTime,
  type IsoDateTimeAction,
  type IsoDateTimeIssue,
} from './isoDateTime.ts';

describe('isoDateTime', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsoDateTimeAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iso_date_time',
      reference: isoDateTime,
      expects: null,
      requirement: ISO_DATE_TIME_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsoDateTimeAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isoDateTime()).toStrictEqual(action);
      expect(isoDateTime(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isoDateTime('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsoDateTimeAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isoDateTime(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsoDateTimeAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isoDateTime();

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

    test('for normal date times', () => {
      expectNoActionIssue(action, [
        '0000-01-01T00:00',
        '9999-12-31T23:59',
        '2023-07-11T19:34',
      ]);
    });

    test('for space as separator', () => {
      expectNoActionIssue(action, [
        '0000-01-01 00:00',
        '2023-07-11 17:26',
        '9999-12-31 23:59',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoDateTime('message');
    const baseIssue: Omit<IsoDateTimeIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'iso_date_time',
      expected: null,
      message: 'message',
      requirement: ISO_DATE_TIME_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 0000-01-01T00:00',
        '0000-01-01T00:00 ',
        ' 0000-01-01T00:00 ',
      ]);
    });

    test('for missing separators', () => {
      expectActionIssue(action, baseIssue, [
        '000001-01T00:00',
        '0000-0101T00:00',
        '0000-01-0100:00',
        '0000-01-01T0000',
      ]);
    });

    test('for wrong separators', () => {
      expectActionIssue(action, baseIssue, [
        // Date separators
        '0000 01 01T00:00',
        '0000–01–01T00:00',
        '0000/01/01T00:00',
        '0000_01_01T00:00',
        '0000:01:01T00:00',

        // Date/time delimiter
        '0000-01-01A00:00',
        '0000-01-01U00:00',
        '0000-01-01Z00:00',
        '0000-01-01_00:00',
        '0000-01-01-00:00',

        // Time separators
        '0000-01-01T00 00',
        '0000-01-01T00-00',
        '0000-01-01T00_00',
        '0000-01-01T00–00',
        '0000-01-01T00/00',
        '0000-01-01T00.00',
      ]);
    });

    test('for invalid year', () => {
      expectActionIssue(action, baseIssue, [
        '-01-01T00:00', // missing digits
        '0-01-01T00:00', // 1 digit
        '00-01-01T00:00', // 2 digit
        '000-01-01T00:00', // 3 digits
        '00000-01-01T00:00', // 5 digits
      ]);
    });

    test('for invalid month', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01T00:00', // missing digits
        '0000-1-01T00:00', // 1 digit
        '0000-010-01T00:00', // 3 digits
        '0000-00-01T00:00', // 00
        '0000-13-01T00:00', // 13
        '0000-99-01T00:00', // 99
      ]);
    });

    test('for invalid day', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01T00:00', // missing digits
        '0000-01-1T00:00', // 1 digit
        '0000-01-010T00:00', // 3 digits
        '0000-01-00T00:00', // 00
        '0000-01-32T00:00', // 32
        '0000-01-99T00:00', // 99
      ]);
    });

    test('for invalid hour', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T:00', // missing digits
        '0000-01-01T00', // missing digits
        '0000-01-01T0:00', // 1 digit
        '0000-01-01T000:00', // 3 digits
        '0000-01-01T24:00', // 24
        '0000-01-01T99:00', // 99
      ]);
    });

    test('for invalid minute', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00', // missing digits
        '0000-01-01T00:0', // 1 digit
        '0000-01-01T00:000', // 3 digits
        '0000-01-01T00:60', // 60
        '0000-01-01T00:99', // 99
      ]);
    });
  });
});
