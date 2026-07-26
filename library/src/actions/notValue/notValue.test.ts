import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { _stringify } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { notValue, type NotValueAction } from './notValue.ts';

describe('notValue', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NotValueAction<number, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'not_value',
      reference: notValue,
      expects: '!5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotValueAction<number, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notValue(5)).toStrictEqual(action);
      expect(notValue(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notValue(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotValueAction<number, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notValue(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotValueAction<number, 5, typeof message>);
    });
  });

  describe('should return dataset with issues', () => {
    test('for untyped inputs', () => {
      const issues: [NumberIssue] = [
        {
          kind: 'schema',
          type: 'number',
          input: null,
          expected: 'number',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        notValue(1)['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid bigints', () => {
      expectNoActionIssue(notValue(10n), [-123n, 0n, 9n, 11n, 123n]);
    });

    test('for valid non-bigints', () => {
      expectNoActionIssue(notValue(10n), [
        9,
        11,
        9.0,
        11.0,
        '9',
        '11',
        '9.0',
        '11.0',
        '',
        ' ',
        new Date(9),
        new Date(11),
        true,
        false,
      ]);
      expectNoActionIssue(notValue(1n), [
        0,
        0.0,
        '0',
        ' 0 ',
        '',
        ' ',
        false,
        new Date(0),
      ]);
      expectNoActionIssue(notValue(0n), [
        1,
        1.0,
        '1',
        ' 1 ',
        true,
        new Date(1),
      ]);
    });

    test('for valid booleans', () => {
      expectNoActionIssue(notValue(true), [false]);
      expectNoActionIssue(notValue(false), [true]);
    });

    test('for valid non-booleans', () => {
      expectNoActionIssue(notValue(true), [
        0n,
        0,
        0.0,
        '0',
        '0.0',
        ' 0 ',
        '',
        ' ',
        new Date(0),
      ]);
      expectNoActionIssue(notValue(true), [
        123n,
        123,
        123.0,
        '123',
        '123.0',
        'foo',
        'true',
        new Date(123),
      ]);
      expectNoActionIssue(notValue(false), [
        1n,
        1,
        1.0,
        '1',
        '1.0',
        ' 1 ',
        new Date(1),
      ]);
      expectNoActionIssue(notValue(false), [
        123n,
        123,
        123.0,
        '123',
        '123.0',
        'foo',
        'false',
        new Date(123),
      ]);
    });

    test('for valid dates', () => {
      const date = new Date();
      const nextDate = new Date(+date + 1);
      expectNoActionIssue(notValue(date), [
        new Date(+date - 1),
        nextDate,
        new Date(+date + 999999),
        new Date(nextDate.getTime()),
        new Date(nextDate.toISOString()),
        new Date(
          nextDate.getFullYear(),
          nextDate.getMonth(),
          nextDate.getDate(),
          nextDate.getHours(),
          nextDate.getMinutes(),
          nextDate.getSeconds(),
          nextDate.getMilliseconds()
        ),
      ]);
    });

    test('for valid non-dates', () => {
      expectNoActionIssue(notValue(new Date(10)), [
        9n,
        11n,
        9,
        11,
        9.0,
        11.0,
        '9',
        '11',
        '9.0',
        '11.0',
        '',
        ' ',
        true,
        false,
      ]);
      expectNoActionIssue(notValue(new Date(1)), [
        0,
        0.0,
        0n,
        '0',
        '0.0',
        ' 0 ',
        '',
        ' ',
        false,
      ]);
      expectNoActionIssue(notValue(new Date(0)), [
        1,
        1.0,
        1n,
        '1',
        '1.0',
        ' 1 ',
        true,
      ]);
    });

    test('for valid numbers', () => {
      expectNoActionIssue(notValue(10), [
        -Infinity,
        Number.MIN_VALUE,
        -10,
        -9,
        9,
        11,
        9999,
        Number.MAX_VALUE,
        Infinity,
        NaN,
      ]);
    });

    test('for valid non-numbers', () => {
      expectNoActionIssue(notValue(10), [
        9n,
        11n,
        '9',
        '11',
        '9.0',
        '11.0',
        '',
        ' ',
        new Date(9),
        true,
        false,
      ]);
      expectNoActionIssue(notValue(1), [
        0n,
        '0',
        '0.0',
        ' 0 ',
        '',
        ' ',
        false,
        new Date(0),
      ]);
      expectNoActionIssue(notValue(0), [
        1n,
        '1',
        '1.0',
        ' 1 ',
        true,
        new Date(1),
      ]);
    });

    test('for valid strings', () => {
      expectNoActionIssue(notValue('2024'), [
        '202',
        '024',
        ' 2024',
        '2024 ',
        '02024',
        '20240',
        '020240',
        '2025',
        '9999',
        'XYZ',
      ]);
    });

    test('for valid non-strings', () => {
      expectNoActionIssue(notValue('10'), [
        9n,
        11n,
        9,
        11,
        9.0,
        11.0,
        new Date(9),
        new Date(11),
        true,
        false,
      ]);
      expectNoActionIssue(notValue('1'), [0n, 0, 0.0, false, new Date(0)]);
      expectNoActionIssue(notValue('0'), [1n, 1, 1.0, true, new Date(1)]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'not_value',
      message: 'message',
    } as const;

    const getReceived = (value: unknown): string =>
      value instanceof Date ? value.toJSON() : _stringify(value);

    test('for invalid bigints', () => {
      expectActionIssue(
        notValue(123n, 'message'),
        { ...baseInfo, expected: '!123', requirement: 123n },
        [123n, BigInt(123), BigInt('123')]
      );
    });

    test('for invalid non-bigints', () => {
      expectActionIssue(
        notValue(123n, 'message'),
        { ...baseInfo, expected: '!123', requirement: 123n },
        [123, 123.0, '123', ' 123 ', new Date(123)],
        getReceived
      );
      expectActionIssue(
        notValue(1n, 'message'),
        { ...baseInfo, expected: '!1', requirement: 1n },
        [1, 1.0, '1', ' 1 ', true, new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValue(0n, 'message'),
        { ...baseInfo, expected: '!0', requirement: 0n },
        [0, 0.0, '0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
    });

    test('for invalid booleans', () => {
      expectActionIssue(
        notValue(true, 'message'),
        { ...baseInfo, expected: '!true', requirement: true },
        [true]
      );
      expectActionIssue(
        notValue(false, 'message'),
        { ...baseInfo, expected: '!false', requirement: false },
        [false]
      );
    });

    test('for invalid non-booleans', () => {
      expectActionIssue(
        notValue(true, 'message'),
        { ...baseInfo, expected: '!true', requirement: true },
        [1, 1.0, 1n, '1', '1.0', ' 1 ', new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValue(false, 'message'),
        { ...baseInfo, expected: '!false', requirement: false },
        [0, 0.0, 0n, '0', '0.0', ' 0 ', '', ' ', new Date(0)],
        getReceived
      );
    });

    test('for invalid dates', () => {
      const date = new Date();
      expectActionIssue(
        notValue(date, 'message'),
        { ...baseInfo, expected: `!${date.toJSON()}`, requirement: date },
        [
          date,
          new Date(date.getTime()),
          new Date(date.toISOString()),
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
          ),
        ],
        getReceived
      );
    });

    test('for invalid non-dates', () => {
      const date1 = new Date(123);
      expectActionIssue(
        notValue(date1, 'message'),
        { ...baseInfo, expected: `!${date1.toJSON()}`, requirement: date1 },
        [123, 123.0, 123n, '123', '123.0', ' 123 '],
        getReceived
      );
      const date2 = new Date(1);
      expectActionIssue(
        notValue(date2, 'message'),
        { ...baseInfo, expected: `!${date2.toJSON()}`, requirement: date2 },
        [1, 1.0, 1n, '1', '1.0', ' 1 ', true],
        getReceived
      );
      const date3 = new Date(0);
      expectActionIssue(
        notValue(date3, 'message'),
        { ...baseInfo, expected: `!${date3.toJSON()}`, requirement: date3 },
        [0, 0.0, 0n, '0', '0.0', ' 0 ', '', ' ', false],
        getReceived
      );
    });

    test('for invalid numbers', () => {
      expectActionIssue(
        notValue(123, 'message'),
        { ...baseInfo, expected: '!123', requirement: 123 },
        [123, 123.0, Number(123)]
      );
    });

    test('for invalid non-numbers', () => {
      expectActionIssue(
        notValue(123, 'message'),
        { ...baseInfo, expected: '!123', requirement: 123 },
        [123n, '123', '123.0', ' 123 ', new Date(123)],
        getReceived
      );
      expectActionIssue(
        notValue(1, 'message'),
        { ...baseInfo, expected: '!1', requirement: 1 },
        [1n, '1', '1.0', ' 1 ', true, new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValue(0, 'message'),
        { ...baseInfo, expected: '!0', requirement: 0 },
        [0n, '0', '0.0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
    });

    test('for invalid strings', () => {
      expectActionIssue(
        notValue('2024', 'message'),
        { ...baseInfo, expected: '!"2024"', requirement: '2024' },
        ['2024']
      );
    });

    test('for invalid non-strings', () => {
      expectActionIssue(
        notValue('123', 'message'),
        { ...baseInfo, expected: '!"123"', requirement: '123' },
        [123, 123.0, 123n, new Date(123)],
        getReceived
      );
      expectActionIssue(
        notValue('1', 'message'),
        { ...baseInfo, expected: '!"1"', requirement: '1' },
        [1n, 1, 1.0, true, new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValue('0', 'message'),
        { ...baseInfo, expected: '!"0"', requirement: '0' },
        [0n, 0, 0.0, false, new Date(0)],
        getReceived
      );
    });
  });
});
