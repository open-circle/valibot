import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { _stringify } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { values, type ValuesAction } from './values.ts';

describe('values', () => {
  describe('should return action object', () => {
    const baseAction: Omit<
      ValuesAction<number, [2, 4, 6], never>,
      'message'
    > = {
      kind: 'validation',
      type: 'values',
      reference: values,
      expects: '(2 | 4 | 6)',
      requirement: [2, 4, 6],
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: ValuesAction<number, [2, 4, 6], undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(values([2, 4, 6])).toStrictEqual(action);
      expect(values([2, 4, 6], undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(values([2, 4, 6], 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies ValuesAction<number, [2, 4, 6], string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(values([2, 4, 6], message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies ValuesAction<number, [2, 4, 6], typeof message>);
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
        values([1])['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid bigints', () => {
      expectNoActionIssue(values([-2n, 3n]), [-2n, 3n, BigInt(3), BigInt('3')]);
      expectNoActionIssue(values([0n]), [0n]);
    });

    test('for valid non-bigints', () => {
      expectNoActionIssue(values([-123n, 456n]), [
        -123,
        456,
        -123.0,
        456.0,
        '-123',
        '456',
        ' -123 ',
        ' 456 ',
        new Date(-123),
        new Date(456),
      ]);
      expectNoActionIssue(values([1n]), [
        1,
        1.0,
        '1',
        ' 1 ',
        true,
        new Date(1),
      ]);
      expectNoActionIssue(values([0n]), [
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
      expectNoActionIssue(values([true]), [true]);
      expectNoActionIssue(values([false]), [false]);
      expectNoActionIssue(values([true, false]), [false, true]);
    });

    test('for valid non-booleans', () => {
      expectNoActionIssue(values([true]), [
        1,
        1.0,
        1n,
        '1',
        '1.0',
        ' 1 ',
        new Date(1),
      ]);
      expectNoActionIssue(values([false]), [
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
      expectNoActionIssue(values([false, true]), [
        1,
        0,
        1.0,
        0.0,
        1n,
        0n,
        '1',
        '0',
        '1.0',
        '0.0',
        ' 1 ',
        ' 0 ',
        '',
        ' ',
        new Date(1),
        new Date(0),
      ]);
    });

    test('for valid dates', () => {
      const date = new Date();
      const nextDate = new Date(+date + 1);
      expectNoActionIssue(values([date, nextDate]), [
        nextDate,
        date,
        new Date(+nextDate),
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
      expectNoActionIssue(values([new Date(-123), new Date(456)]), [
        -123,
        456,
        -123.0,
        456.0,
        -123n,
        456n,
        '-123',
        '456',
        '-123.0',
        '456.0',
        ' -123 ',
        ' 456 ',
      ]);
      expectNoActionIssue(values([new Date(1)]), [
        1,
        1.0,
        1n,
        '1',
        '1.0',
        ' 1 ',
        true,
      ]);
      expectNoActionIssue(values([new Date(0)]), [
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
      expectNoActionIssue(values([-2, 3]), [-2, 3, 3.0, Number('3')]);
      expectNoActionIssue(values([0]), [0]);
    });

    test('for valid non-numbers', () => {
      expectNoActionIssue(values([-123, 456]), [
        -123n,
        456n,
        '-123',
        '456',
        '-123.0',
        '456.0',
        ' -123 ',
        ' 456 ',
        new Date(-123),
        new Date(456),
      ]);
      expectNoActionIssue(values([1]), [
        1n,
        '1',
        '1.0',
        ' 1 ',
        true,
        new Date(1),
      ]);
      expectNoActionIssue(values([0]), [
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
      expectNoActionIssue(values(['2024', '2025']), ['2024', '2025']);
      expectNoActionIssue(values(['0']), ['0']);
    });

    test('for valid non-strings', () => {
      expectNoActionIssue(values(['-123', '456']), [
        -123n,
        456n,
        -123,
        456,
        -123.0,
        456.0,
        new Date(-123),
        new Date(456),
      ]);
      expectNoActionIssue(values(['1']), [1n, 1, 1.0, true, new Date(1)]);
      expectNoActionIssue(values(['0']), [0n, 0, 0.0, false, new Date(0)]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'values',
      message: 'message',
    } as const;

    const getReceived = (value: unknown): string =>
      value instanceof Date ? value.toJSON() : _stringify(value);

    test('for invalid bigints', () => {
      expectActionIssue(
        values([-2n, 0n, 1n], 'message'),
        { ...baseInfo, expected: '(-2 | 0 | 1)', requirement: [-2n, 0n, 1n] },
        [-1n, 2n, 100n]
      );
    });

    test('for invalid non-bigints', () => {
      expectActionIssue(
        values([10n, 11n, 12n], 'message'),
        {
          ...baseInfo,
          expected: '(10 | 11 | 12)',
          requirement: [10n, 11n, 12n],
        },
        [
          9,
          13,
          9.0,
          13.0,
          '9',
          '13',
          '9.0',
          '13.0',
          '',
          ' ',
          new Date(9),
          new Date(13),
          true,
          false,
        ],
        getReceived
      );
      expectActionIssue(
        values([1n], 'message'),
        { ...baseInfo, expected: '1', requirement: [1n] },
        [0, 0.0, '0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
      expectActionIssue(
        values([0n], 'message'),
        { ...baseInfo, expected: '0', requirement: [0n] },
        [1, 1.0, '1', ' 1 ', true, new Date(1)],
        getReceived
      );
    });

    test('for invalid booleans', () => {
      expectActionIssue(
        values([true], 'message'),
        { ...baseInfo, expected: 'true', requirement: [true] },
        [false]
      );
      expectActionIssue(
        values([false], 'message'),
        { ...baseInfo, expected: 'false', requirement: [false] },
        [true]
      );
    });

    test('for invalid non-booleans', () => {
      expectActionIssue(
        values([true], 'message'),
        { ...baseInfo, expected: 'true', requirement: [true] },
        [0n, 0, 0.0, '0', '0.0', ' 0 ', '', ' ', new Date(0)],
        getReceived
      );
      expectActionIssue(
        values([true], 'message'),
        { ...baseInfo, expected: 'true', requirement: [true] },
        [123n, 123, 123.0, '123', '123.0', 'foo', 'true', new Date(123)],
        getReceived
      );
      expectActionIssue(
        values([false], 'message'),
        { ...baseInfo, expected: 'false', requirement: [false] },
        [1n, 1, 1.0, '1', '1.0', ' 1 ', new Date(1)],
        getReceived
      );
      expectActionIssue(
        values([false], 'message'),
        { ...baseInfo, expected: 'false', requirement: [false] },
        [123n, 123, 123.0, '123', '123.0', 'foo', 'false', new Date(123)],
        getReceived
      );
    });

    test('for invalid dates', () => {
      const date = new Date();
      const datePlusTwo = new Date(+date + 2);
      expectActionIssue(
        values<Date, [Date, Date], 'message'>([date, datePlusTwo], 'message'),
        {
          ...baseInfo,
          expected: `(${date.toJSON()} | ${datePlusTwo.toJSON()})`,
          requirement: [date, datePlusTwo],
        },
        [new Date(+date - 1), new Date(+date + 1), new Date(+date + 999999)],
        (value) => value.toJSON()
      );
    });

    test('for invalid non-dates', () => {
      const date1 = new Date(10);
      expectActionIssue(
        values([date1], 'message'),
        { ...baseInfo, expected: date1.toJSON(), requirement: [date1] },
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
        values([date2], 'message'),
        { ...baseInfo, expected: date2.toJSON(), requirement: [date2] },
        [0, 0.0, 0n, '0', '0.0', ' 0 ', '', ' ', false],
        getReceived
      );
      const date3 = new Date(0);
      expectActionIssue(
        values([date3], 'message'),
        { ...baseInfo, expected: date3.toJSON(), requirement: [date3] },
        [1, 1.0, 1n, '1', '1.0', ' 1 ', true],
        getReceived
      );
    });

    test('for invalid numbers', () => {
      expectActionIssue(
        values([-123, 456], 'message'),
        { ...baseInfo, expected: '(-123 | 456)', requirement: [-123, 456] },
        [
          -Infinity,
          Number.MIN_VALUE,
          -124,
          -122,
          0,
          455,
          457,
          9999,
          Number.MAX_VALUE,
          Infinity,
          NaN,
        ]
      );
    });

    test('for invalid non-numbers', () => {
      expectActionIssue(
        values([10, 11, 12], 'message'),
        { ...baseInfo, expected: '(10 | 11 | 12)', requirement: [10, 11, 12] },
        [
          9n,
          13n,
          '9',
          '13',
          '9.0',
          '13.0',
          '',
          ' ',
          new Date(9),
          new Date(13),
          true,
          false,
        ],
        getReceived
      );
      expectActionIssue(
        values([1], 'message'),
        { ...baseInfo, expected: '1', requirement: [1] },
        [0n, '0', '0.0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
      expectActionIssue(
        values([0], 'message'),
        { ...baseInfo, expected: '0', requirement: [0] },
        [1n, '1', '1.0', ' 1 ', true, new Date(1)],
        getReceived
      );
    });

    test('for invalid strings', () => {
      expectActionIssue(
        values(['2024', '2025'], 'message'),
        {
          ...baseInfo,
          expected: '("2024" | "2025")',
          requirement: ['2024', '2025'],
        },
        [
          '202',
          '024',
          ' 2024',
          '2024 ',
          '02024',
          '20240',
          '020240',
          '2026',
          '9999',
          'XYZ',
        ]
      );
    });

    test('for invalid non-strings', () => {
      expectActionIssue(
        values(['10', '11', '12'], 'message'),
        {
          ...baseInfo,
          expected: '("10" | "11" | "12")',
          requirement: ['10', '11', '12'],
        },
        [9n, 13n, 9, 13, 9.0, 13.0, new Date(9), new Date(13), true, false],
        getReceived
      );
      expectActionIssue(
        values(['1'], 'message'),
        { ...baseInfo, expected: '"1"', requirement: ['1'] },
        [0n, 0, 0.0, false, new Date(0)],
        getReceived
      );
      expectActionIssue(
        values(['0'], 'message'),
        { ...baseInfo, expected: '"0"', requirement: ['0'] },
        [1n, 1, 1.0, true, new Date(1)],
        getReceived
      );
    });
  });
});
