import { describe, expect, test } from 'vitest';
import { RFC_3339_TIME_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import { rfcTime, type RfcTimeAction, type RfcTimeIssue } from './rfcTime.ts';

describe('rfcTime', () => {
  describe('should return action object', () => {
    const baseAction: Omit<RfcTimeAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'rfc_time',
      reference: rfcTime,
      expects: null,
      requirement: RFC_3339_TIME_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: RfcTimeAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(rfcTime()).toStrictEqual(action);
      expect(rfcTime(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(rfcTime('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies RfcTimeAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(rfcTime(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies RfcTimeAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = rfcTime();

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

    test('for valid RFC 3339 times', () => {
      expectNoActionIssue(action, [
        '00:00:00Z',
        '14:30:45Z',
        '14:30:45z',
        '23:59:59-05:00',
        '14:30:45+02:00',
        '14:30:45.1Z',
        '14:30:45.123Z',
        '14:30:45.123456789+14:00',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = rfcTime('message');
    const baseIssue: Omit<RfcTimeIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'rfc_time',
      expected: null,
      message: 'message',
      requirement: RFC_3339_TIME_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 14:30:45Z',
        '14:30:45Z ',
        '14:30:45 Z',
      ]);
    });

    test('for missing offset', () => {
      expectActionIssue(action, baseIssue, [
        '14:30:45',
        '14:30:45.123',
        '00:00:00',
      ]);
    });

    test('for missing seconds', () => {
      expectActionIssue(action, baseIssue, ['14:30Z', '14:30+02:00', '14:30']);
    });

    test('for invalid hour', () => {
      expectActionIssue(action, baseIssue, [
        ':30:45Z', // missing digits
        '4:30:45Z', // 1 digit
        '024:30:45Z', // 3 digits
        '24:30:45Z', // 24
        '99:30:45Z', // 99
      ]);
    });

    test('for invalid minute', () => {
      expectActionIssue(action, baseIssue, ['14:60:45Z', '14:99:45Z']);
    });

    test('for invalid second', () => {
      expectActionIssue(action, baseIssue, ['14:30:60Z', '14:30:99Z']);
    });

    test('for invalid fraction', () => {
      expectActionIssue(action, baseIssue, ['14:30:45.Z', '14:30:45,5Z']);
    });

    test('for invalid offset', () => {
      expectActionIssue(action, baseIssue, [
        '14:30:45+99:00', // hour out of range
        '14:30:45+02:60', // minute out of range
        '14:30:45+0200', // missing colon
        '14:30:45+2:00', // 1-digit hour
        '14:30:45UTC', // not Z or numeric offset
      ]);
    });
  });
});
