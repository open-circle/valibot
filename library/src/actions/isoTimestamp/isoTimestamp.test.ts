import { describe, expect, test } from 'vitest';
import { ISO_TIMESTAMP_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import type { IsoTimestampAction, IsoTimestampIssue } from './isoTimestamp.ts';
import { isoTimestamp } from './isoTimestamp.ts';

describe('isoTimestamp', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsoTimestampAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iso_timestamp',
      reference: isoTimestamp,
      expects: null,
      requirement: ISO_TIMESTAMP_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsoTimestampAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isoTimestamp()).toStrictEqual(action);
      expect(isoTimestamp(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isoTimestamp('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsoTimestampAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isoTimestamp(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsoTimestampAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isoTimestamp();

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

    test('for zero UTC offset', () => {
      expectNoActionIssue(action, [
        '0000-01-01T00:00:00.000Z',
        '2023-07-11T17:26:27.243Z',
        '9999-12-31T23:59:59.999Z',
      ]);
    });

    test('for specific UTC offset', () => {
      expectNoActionIssue(action, [
        // '+hh:mm'
        '0000-01-01T00:00:00.000+00:00',
        '2023-07-11T17:26:27.243+12:34',
        '9999-12-31T23:59:59.999+23:59',
        // '+hhmm'
        '0000-01-01T00:00:00.000+0000',
        '2023-07-11T17:26:27.243+1234',
        '9999-12-31T23:59:59.999+2359',
        // '+hh'
        '0000-01-01T00:00:00.000+00',
        '2023-07-11T17:26:27.243+12',
        '9999-12-31T23:59:59.999+23',
        // '-hh:mm'
        '0000-01-01T00:00:00.000-00:00',
        '2023-07-11T17:26:27.243-12:34',
        '9999-12-31T23:59:59.999-23:59',
        // '-hhmm'
        '0000-01-01T00:00:00.000-0000',
        '2023-07-11T17:26:27.243-1234',
        '9999-12-31T23:59:59.999-2359',
        // '-hh'
        '0000-01-01T00:00:00.000-00',
        '2023-07-11T17:26:27.243-12',
        '9999-12-31T23:59:59.999-23',
      ]);
    });

    test('for without milliseconds', () => {
      expectNoActionIssue(action, [
        '0000-01-01T00:00:00Z',
        '2023-07-11T17:26:27Z',
        '9999-12-31T23:59:59Z',
      ]);
    });

    test('for 9 milliseconds digits', () => {
      expectNoActionIssue(action, [
        '0000-01-01T00:00:00.000000000Z',
        '2023-07-11T17:26:27.184618592Z',
        '9999-12-31T23:59:59.999999999Z',
      ]);
    });

    test('for space as separator', () => {
      expectNoActionIssue(action, [
        '0000-01-01 00:00:00.000Z',
        '2023-07-11 17:26:27.243Z',
        '9999-12-31 23:59:59.999Z',
      ]);
    });

    test('for space as separator in UTC offset', () => {
      expectNoActionIssue(action, [
        '0000-01-01 00:00:00.000 +00:00',
        '0000-01-01 00:00:00.000 -00:00',
        '2023-07-11 17:26:27.243 +0000',
        '2023-07-11 17:26:27.243 -0000',
        '9999-12-31 23:59:59.999 +00',
        '9999-12-31 23:59:59.999 -00',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoTimestamp('message');
    const baseIssue: Omit<IsoTimestampIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'iso_timestamp',
      expected: null,
      message: 'message',
      requirement: ISO_TIMESTAMP_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 0000-01-01T00:00:00.000Z',
        '0000-01-01T00:00:00.000Z ',
        ' 0000-01-01T00:00:00.000Z ',
      ]);
    });

    test('for missing separators', () => {
      expectActionIssue(action, baseIssue, [
        '000001-01T00:00:00.000Z',
        '0000-0101T00:00:00.000Z',
        '0000-01-0100:00:00.000Z',
        '0000-01-01T0000:00.000Z',
        '0000-01-01T00:0000.000Z',
        '0000-01-01T00:00:00000Z',
        '0000-01-01T00:00:00.000',
        '0000-01-01T00:00:00.00000:00',
      ]);
    });

    test('for double separators', () => {
      expectActionIssue(action, baseIssue, [
        '0000--01-01T00:00:00.000Z',
        '0000-01--01T00:00:00.000Z',
        '0000-01-01TT00:00:00.000Z',
        '0000-01-01T00::00:00.000Z',
        '0000-01-01T00:00::00.000Z',
        '0000-01-01T00:00:00..000Z',
        '0000-01-01T00:00:00.000ZZ',
        '0000-01-01T00:00:00.000++00:00',
        '0000-01-01T00:00:00.000--00:00',
        '0000-01-01T00:00:00.000+00::00',
      ]);
    });

    test('for wrong separators', () => {
      expectActionIssue(action, baseIssue, [
        // Date separators
        '0000 01 01T00:00:00.000Z',
        '0000–01–01T00:00:00.000Z',
        '0000/01/01T00:00:00.000Z',
        '0000_01_01T00:00:00.000Z',
        '0000:01:01T00:00:00.000Z',

        // Date/time delimiter
        '0000-01-01A00:00:00.000Z',
        '0000-01-01U00:00:00.000Z',
        '0000-01-01Z00:00:00.000Z',
        '0000-01-01_00:00:00.000Z',
        '0000-01-01-00:00:00.000Z',

        // Time separators
        '0000-01-01T00 00 00.000Z',
        '0000-01-01T00-00-00.000Z',
        '0000-01-01T00_00_00.000Z',
        '0000-01-01T00–00–00.000Z',
        '0000-01-01T00/00/00.000Z',
        '0000-01-01T00.00.00.000Z',

        // Milliseconds separator
        '0000-01-01T00:00:00 000Z',
        '0000-01-01T00:00:00-000Z',
        '0000-01-01T00:00:00_000Z',
        '0000-01-01T00:00:00–000Z',
        '0000-01-01T00:00:00/000Z',
        '0000-01-01T00:00:00:000Z',
      ]);
    });

    test('for invalid year', () => {
      expectActionIssue(action, baseIssue, [
        '-01-01T00:00:00.000Z', // missing digits
        '0-01-01T00:00:00.000Z', // 1 digit
        '00-01-01T00:00:00.000Z', // 2 digit
        '000-01-01T00:00:00.000Z', // 3 digits
        '00000-01-01T00:00:00.000Z', // 5 digits
      ]);
    });

    test('for invalid month', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01T00:00:00.000Z', // missing digits
        '0000-1-01T00:00:00.000Z', // 1 digit
        '0000-010-01T00:00:00.000Z', // 3 digits
        '0000-00-01T00:00:00.000Z', // 00
        '0000-13-01T00:00:00.000Z', // 13
        '0000-99-01T00:00:00.000Z', // 99
      ]);
    });

    test('for invalid day', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01T00:00:00.000Z', // missing digits
        '0000-01-1T00:00:00.000Z', // 1 digit
        '0000-01-010T00:00:00.000Z', // 3 digits
        '0000-01-00T00:00:00.000Z', // 00
        '0000-01-32T00:00:00.000Z', // 32
        '0000-01-99T00:00:00.000Z', // 99
      ]);
    });

    test('for invalid hour', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T:00:00.000Z', // missing digits
        '0000-01-01T00:00.000Z', // missing digits
        '0000-01-01T0:00:00.000Z', // 1 digit
        '0000-01-01T000:00:00.000Z', // 3 digits
        '0000-01-01T24:00:00.000Z', // 24
        '0000-01-01T99:00:00.000Z', // 99
      ]);
    });

    test('for invalid minute', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00:00.000Z', // missing digits
        '0000-01-01T00:0:00.000Z', // 1 digit
        '0000-01-01T00:000:00.000Z', // 3 digits
        '0000-01-01T00:60:00.000Z', // 60
        '0000-01-01T00:99:00.000Z', // 99
      ]);
    });

    test('for invalid second', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00:00:.000Z', // missing digits
        '0000-01-01T00:00.000Z', // missing digits
        '0000-01-01T00:00:0.000Z', // 1 digit
        '0000-01-01T00:00:000.000Z', // 3 digits
        '0000-01-01T00:00:60.000Z', // 60
        '0000-01-01T00:00:99.000Z', // 99
      ]);
    });

    test('for invalid milliseconds', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00:00:00.Z', // 0 digits
        '0000-01-01T00:00:00.0000000000Z', // 10 digits
      ]);
    });

    test('for missing offsets', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00:00:00.000',
        '0000-01-01T00:00:00.000+',
        '0000-01-01T00:00:00.000-',
      ]);
    });

    test('for invalid hour offset', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00:00:00.000+:00', // missing digits
        '0000-01-01T00:00:00.000+0:00', // 1 digit
        '0000-01-01T00:00:00.000+000:00', // 3 digits
        '0000-01-01T00:00:00.000+24:00', // 24
        '0000-01-01T00:00:00.000+2400', // 24
        '0000-01-01T00:00:00.000+24', // 24
        '0000-01-01T00:00:00.000+99:00', // 99
        '0000-01-01T00:00:00.000+9900', // 99
        '0000-01-01T00:00:00.000+99', // 99
      ]);
    });

    test('for invalid minute offset', () => {
      expectActionIssue(action, baseIssue, [
        '0000-01-01T00:00:00.000+00:', // missing digits
        '0000-01-01T00:00:00.000+00:0', // 1 digit
        '0000-01-01T00:00:00.000+000', // 1 digit
        '0000-01-01T00:00:00.000+00:000', // 3 digits
        '0000-01-01T00:00:00.000+00000', // 3 digits
        '0000-01-01T00:00:00.000+00:60', // 60
        '0000-01-01T00:00:00.000+0060', // 60
        '0000-01-01T00:00:00.000+00:99', // 99
        '0000-01-01T00:00:00.000+0099', // 99
      ]);
    });
  });
});
