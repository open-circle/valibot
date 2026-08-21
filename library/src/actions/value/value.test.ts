import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { _stringify } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { value, type ValueAction } from './value.ts';

describe('value', () => {
  describe('should return action object', () => {
    const baseAction: Omit<ValueAction<number, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'value',
      reference: value,
      expects: '5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: ValueAction<number, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(value(5)).toStrictEqual(action);
      expect(value(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(value(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies ValueAction<number, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(value(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies ValueAction<number, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
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
        value(1)['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid bigints', () => {
      expectNoActionIssue(value(123n), [123n, BigInt(123), BigInt('123')]);
    });

    test('for valid non-bigints', () => {
      expectNoActionIssue(value(123n), [
        123,
        123.0,
        '123',
        ' 123 ',
        new Date(123),
      ]);
      expectNoActionIssue(value(1n), [1, 1.0, '1', ' 1 ', true, new Date(1)]);
      expectNoActionIssue(value(0n), [
        0,
        0.0,
        '0',
        ' 0 ',
        '',
        ' ',
        false,
        new Date(0),
      ]);
    });

    test('for valid booleans', () => {
      expectNoActionIssue(value(true), [true]);
      expectNoActionIssue(value(false), [false]);
    });

    test('for valid non-booleans', () => {
      expectNoActionIssue(value(true), [
        1,
        1.0,
        1n,
        '1',
        '1.0',
        ' 1 ',
        new Date(1),
      ]);
      expectNoActionIssue(value(false), [
        0,
        0.0,
        0n,
        '0',
        '0.0',
        ' 0 ',
        '',
        ' ',
        new Date(0),
      ]);
    });

    test('for valid dates', () => {
      const date = new Date();
      expectNoActionIssue(value(date), [
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
      ]);
    });

    test('for valid non-dates', () => {
      expectNoActionIssue(value(new Date(123)), [
        123,
        123.0,
        123n,
        '123',
        '123.0',
        ' 123 ',
      ]);
      expectNoActionIssue(value(new Date(1)), [
        1,
        1.0,
        1n,
        '1',
        '1.0',
        ' 1 ',
        true,
      ]);
      expectNoActionIssue(value(new Date(0)), [
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
    });

    test('for valid numbers', () => {
      expectNoActionIssue(value(123), [123, 123.0, Number('123')]);
      // NaN === NaN must pass: <= / >= comparisons both return false for NaN,
      // so without Object.is the validator incorrectly rejects the input.
      expectNoActionIssue(value(NaN), [NaN, Number('not-a-number')]);
    });

    test('for valid non-numbers', () => {
      expectNoActionIssue(value(123), [
        123n,
        '123',
        '123.0',
        ' 123 ',
        new Date(123),
      ]);
      expectNoActionIssue(value(1), [1n, '1', '1.0', ' 1 ', true, new Date(1)]);
      expectNoActionIssue(value(0), [
        0n,
        '0',
        '0.0',
        ' 0 ',
        '',
        ' ',
        false,
        new Date(0),
      ]);
    });

    test('for valid strings', () => {
      expectNoActionIssue(value('2024'), ['2024']);
    });

    test('for valid non-strings', () => {
      expectNoActionIssue(value('1'), [1n, 1, 1.0, true, new Date(1)]);
      expectNoActionIssue(value('0'), [0n, 0, 0.0, false, new Date(0)]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'value',
      message: 'message',
    } as const;

    const getReceived = (value: unknown): string =>
      value instanceof Date ? value.toJSON() : _stringify(value);

    test('for invalid bigints', () => {
      expectActionIssue(
        value(10n, 'message'),
        { ...baseInfo, expected: '10', requirement: 10n },
        [-123n, 0n, 9n, 11n, 123n]
      );
    });

    test('for invalid non-bigints', () => {
      expectActionIssue(
        value(10n, 'message'),
        { ...baseInfo, expected: '10', requirement: 10n },
        [
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
        ],
        getReceived
      );
      expectActionIssue(
        value(1n, 'message'),
        { ...baseInfo, expected: '1', requirement: 1n },
        [0, 0.0, '0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
      expectActionIssue(
        value(0n, 'message'),
        { ...baseInfo, expected: '0', requirement: 0n },
        [1, 1.0, '1', ' 1 ', true, new Date(1)],
        getReceived
      );
    });

    test('for invalid booleans', () => {
      expectActionIssue(
        value(true, 'message'),
        { ...baseInfo, expected: 'true', requirement: true },
        [false]
      );
      expectActionIssue(
        value(false, 'message'),
        { ...baseInfo, expected: 'false', requirement: false },
        [true]
      );
    });

    test('for invalid non-booleans', () => {
      expectActionIssue(
        value(true, 'message'),
        { ...baseInfo, expected: 'true', requirement: true },
        [0n, 0, 0.0, '0', '0.0', ' 0 ', '', ' ', new Date(0)],
        getReceived
      );
      expectActionIssue(
        value(true, 'message'),
        { ...baseInfo, expected: 'true', requirement: true },
        [123n, 123, 123.0, '123', '123.0', 'foo', 'true', new Date(123)],
        getReceived
      );
      expectActionIssue(
        value(false, 'message'),
        { ...baseInfo, expected: 'false', requirement: false },
        [1n, 1, 1.0, '1', '1.0', ' 1 ', new Date(1)],
        getReceived
      );
      expectActionIssue(
        value(false, 'message'),
        { ...baseInfo, expected: 'false', requirement: false },
        [123n, 123, 123.0, '123', '123.0', 'foo', 'false', new Date(123)],
        getReceived
      );
    });

    test('for invalid dates', () => {
      const date = new Date();
      expectActionIssue(
        value<Date, Date, 'message'>(date, 'message'),
        { ...baseInfo, expected: `${date.toJSON()}`, requirement: date },
        [new Date(+date - 1), new Date(+date + 1), new Date(+date + 999999)],
        (value) => value.toJSON()
      );
    });

    test('for invalid non-dates', () => {
      const date1 = new Date(10);
      expectActionIssue(
        value(date1, 'message'),
        { ...baseInfo, expected: date1.toJSON(), requirement: date1 },
        [
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
        ],
        getReceived
      );
      const date2 = new Date(1);
      expectActionIssue(
        value(date2, 'message'),
        { ...baseInfo, expected: date2.toJSON(), requirement: date2 },
        [0, 0.0, 0n, '0', '0.0', ' 0 ', '', ' ', false],
        getReceived
      );
      const date3 = new Date(0);
      expectActionIssue(
        value(date3, 'message'),
        { ...baseInfo, expected: date3.toJSON(), requirement: date3 },
        [1, 1.0, 1n, '1', '1.0', ' 1 ', true],
        getReceived
      );
    });

    test('for invalid numbers', () => {
      expectActionIssue(
        value(10, 'message'),
        { ...baseInfo, expected: '10', requirement: 10 },
        [
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
        ]
      );
    });

    test('for invalid non-numbers', () => {
      expectActionIssue(
        value(10, 'message'),
        { ...baseInfo, expected: '10', requirement: 10 },
        [9n, 11n, '9', '11', '9.0', '11.0', '', ' ', new Date(9), true, false],
        getReceived
      );
      expectActionIssue(
        value(1, 'message'),
        { ...baseInfo, expected: '1', requirement: 1 },
        [0n, '0', '0.0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
      expectActionIssue(
        value(0, 'message'),
        { ...baseInfo, expected: '0', requirement: 0 },
        [1n, '1', '1.0', ' 1 ', true, new Date(1)],
        getReceived
      );
    });

    test('for invalid strings', () => {
      expectActionIssue(
        value('2024', 'message'),
        { ...baseInfo, expected: '"2024"', requirement: '2024' },
        [
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
        ]
      );
    });

    test('for invalid non-strings', () => {
      expectActionIssue(
        value('10', 'message'),
        { ...baseInfo, expected: '"10"', requirement: '10' },
        [9n, 11n, 9, 11, 9.0, 11.0, new Date(9), new Date(11), true, false],
        getReceived
      );
      expectActionIssue(
        value('1', 'message'),
        { ...baseInfo, expected: '"1"', requirement: '1' },
        [0n, 0, 0.0, false, new Date(0)],
        getReceived
      );
      expectActionIssue(
        value('0', 'message'),
        { ...baseInfo, expected: '"0"', requirement: '0' },
        [1n, 1, 1.0, true, new Date(1)],
        getReceived
      );
    });
  });
});
