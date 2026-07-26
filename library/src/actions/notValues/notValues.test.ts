import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { _stringify } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { notValues, type NotValuesAction } from './notValues.ts';

describe('notValues', () => {
  describe('should return action object', () => {
    const baseAction: Omit<
      NotValuesAction<number, [1, 3, 5], never>,
      'message'
    > = {
      kind: 'validation',
      type: 'not_values',
      reference: notValues,
      expects: '!(1 | 3 | 5)',
      requirement: [1, 3, 5],
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotValuesAction<number, [1, 3, 5], undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notValues([1, 3, 5])).toStrictEqual(action);
      expect(notValues([1, 3, 5], undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notValues([1, 3, 5], 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotValuesAction<number, [1, 3, 5], string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notValues([1, 3, 5], message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotValuesAction<number, [1, 3, 5], typeof message>);
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
        notValues([1, 3, 5])['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid bigints', () => {
      expectNoActionIssue(notValues([10n, 11n, 12n]), [
        -123n,
        0n,
        9n,
        13n,
        123n,
      ]);
    });

    test('for valid non-bigints', () => {
      expectNoActionIssue(notValues([10n, 11n, 12n]), [
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
      ]);
      expectNoActionIssue(notValues([1n]), [
        0,
        0.0,
        '0',
        ' 0 ',
        '',
        ' ',
        false,
        new Date(0),
      ]);
      expectNoActionIssue(notValues([0n]), [
        1,
        1.0,
        '1',
        ' 1 ',
        true,
        new Date(1),
      ]);
    });

    test('for valid booleans', () => {
      expectNoActionIssue(notValues([true]), [false]);
      expectNoActionIssue(notValues([false]), [true]);
    });

    test('for valid non-booleans', () => {
      expectNoActionIssue(notValues([true]), [
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
      expectNoActionIssue(notValues([true]), [
        123n,
        123,
        123.0,
        '123',
        '123.0',
        'foo',
        'true',
        new Date(123),
      ]);
      expectNoActionIssue(notValues([false]), [
        1n,
        1,
        1.0,
        '1',
        '1.0',
        ' 1 ',
        new Date(1),
      ]);
      expectNoActionIssue(notValues([false]), [
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
      const negDate = new Date(-10);
      const posDate = new Date(12);
      const nextPosDate = new Date(+posDate + 1);
      expectNoActionIssue(notValues([negDate, posDate]), [
        new Date(0),
        new Date(+negDate - 1),
        new Date(+negDate + 1),
        new Date(+posDate - 1),
        nextPosDate,
        new Date(nextPosDate.getTime()),
        new Date(nextPosDate.toISOString()),
        new Date(
          nextPosDate.getFullYear(),
          nextPosDate.getMonth(),
          nextPosDate.getDate(),
          nextPosDate.getHours(),
          nextPosDate.getMinutes(),
          nextPosDate.getSeconds(),
          nextPosDate.getMilliseconds()
        ),
      ]);

      expectNoActionIssue(notValues([new Date(0)]), [
        new Date(-1),
        new Date(1),
      ]);
    });

    test('for valid non-dates', () => {
      expectNoActionIssue(
        notValues([new Date(10), new Date(11), new Date(12)]),
        [
          9n,
          13n,
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
          true,
          false,
        ]
      );
      expectNoActionIssue(notValues([new Date(1)]), [
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
      expectNoActionIssue(notValues([new Date(0)]), [
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
      expectNoActionIssue(notValues([10, 11, 12]), [
        -Infinity,
        Number.MIN_VALUE,
        -10,
        -9,
        9,
        13,
        9999,
        Number.MAX_VALUE,
        Infinity,
        NaN,
      ]);

      expectNoActionIssue(notValues([0]), [
        -1,
        1,
        -1.0,
        1.0,
        -Infinity,
        Infinity,
        NaN,
      ]);
    });

    test('for valid non-numbers', () => {
      expectNoActionIssue(notValues([10, 11, 12]), [
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
      ]);
      expectNoActionIssue(notValues([1]), [
        0n,
        '0',
        '0.0',
        ' 0 ',
        '',
        ' ',
        false,
        new Date(0),
      ]);
      expectNoActionIssue(notValues([0]), [
        1n,
        '1',
        '1.0',
        ' 1 ',
        true,
        new Date(1),
      ]);
    });

    test('for valid strings', () => {
      expectNoActionIssue(notValues(['-100', '10']), [
        ' -100 ',
        ' 10 ',
        '-100.0',
        '10.0',
        '-1000',
        '100',
        '-0100',
        '010',
        '-99',
        '-101',
        '9',
        '11',
        '',
        ' ',
        'abc',
      ]);

      expectNoActionIssue(notValues(['0']), [
        '',
        ' ',
        ' 0 ',
        '0.0',
        '-0',
        'abc',
      ]);
    });

    test('for valid non-strings', () => {
      expectNoActionIssue(notValues(['10', '11', '12']), [
        9n,
        13n,
        9,
        13,
        9.0,
        13.0,
        new Date(9),
        new Date(13),
        true,
        false,
      ]);
      expectNoActionIssue(notValues(['1']), [0n, 0, 0.0, false, new Date(0)]);
      expectNoActionIssue(notValues(['0']), [1n, 1, 1.0, true, new Date(1)]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'not_values',
      message: 'message',
    } as const;

    const getReceived = (value: unknown): string =>
      value instanceof Date ? value.toJSON() : _stringify(value);

    test('for invalid bigints', () => {
      expectActionIssue(
        notValues([-2n, 0n, 3n], 'message'),
        {
          ...baseInfo,
          expected: '!(-2 | 0 | 3)',
          requirement: [-2n, 0n, 3n],
        },
        [-2n, 0n, 3n, BigInt(3), BigInt('3')]
      );
    });

    test('for invalid non-bigints', () => {
      expectActionIssue(
        notValues([10n, 11n, 12n], 'message'),
        {
          ...baseInfo,
          expected: '!(10 | 11 | 12)',
          requirement: [10n, 11n, 12n],
        },
        [
          10,
          11,
          12,
          10.0,
          11.0,
          12.0,
          '10',
          '11',
          '12',
          ' 10 ',
          ' 11 ',
          ' 12 ',
          new Date(10),
          new Date(11),
          new Date(12),
        ],
        getReceived
      );
      expectActionIssue(
        notValues([1n], 'message'),
        { ...baseInfo, expected: '!1', requirement: [1n] },
        [1, 1.0, '1', ' 1 ', true, new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValues([0n], 'message'),
        { ...baseInfo, expected: '!0', requirement: [0n] },
        [0, 0.0, '0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
    });

    test('for invalid booleans', () => {
      expectActionIssue(
        notValues([true], 'message'),
        { ...baseInfo, expected: '!true', requirement: [true] },
        [true]
      );
      expectActionIssue(
        notValues([false], 'message'),
        { ...baseInfo, expected: '!false', requirement: [false] },
        [false]
      );
    });

    test('for invalid non-booleans', () => {
      expectActionIssue(
        notValues([true], 'message'),
        { ...baseInfo, expected: '!true', requirement: [true] },
        [1, 1.0, 1n, '1', '1.0', new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValues([false], 'message'),
        { ...baseInfo, expected: '!false', requirement: [false] },
        [0, 0.0, 0n, '0', '0.0', '', ' ', new Date(0)],
        getReceived
      );
      expectActionIssue(
        notValues([false, true], 'message'),
        {
          ...baseInfo,
          expected: '!(false | true)',
          requirement: [false, true],
        },
        [
          0,
          1,
          0.0,
          1.0,
          0n,
          1n,
          '0',
          '1',
          '0.0',
          '1.0',
          '',
          ' ',
          new Date(0),
          new Date(1),
        ],
        getReceived
      );
    });

    test('for invalid dates', () => {
      const negDate = new Date(-2);
      const posDate = new Date(3);
      expectActionIssue(
        notValues([negDate, posDate], 'message'),
        {
          ...baseInfo,
          expected: `!(${negDate.toJSON()} | ${posDate.toJSON()})`,
          requirement: [negDate, posDate],
        },
        [
          negDate,
          posDate,
          new Date(posDate.getTime()),
          new Date(posDate.toISOString()),
          new Date(
            posDate.getFullYear(),
            posDate.getMonth(),
            posDate.getDate(),
            posDate.getHours(),
            posDate.getMinutes(),
            posDate.getSeconds(),
            posDate.getMilliseconds()
          ),
        ],
        getReceived
      );

      const zeroDate = new Date(0);
      expectActionIssue(
        notValues([zeroDate], 'message'),
        {
          ...baseInfo,
          expected: `!${zeroDate.toJSON()}`,
          requirement: [zeroDate],
        },
        [zeroDate, new Date(0)],
        getReceived
      );
    });

    test('for invalid non-dates', () => {
      const date1 = new Date(10);
      const date2 = new Date(11);
      const date3 = new Date(12);
      expectActionIssue(
        notValues([date1, date2, date3], 'message'),
        {
          ...baseInfo,
          expected: `!(${date1.toJSON()} | ${date2.toJSON()} | ${date3.toJSON()})`,
          requirement: [date1, date2, date3],
        },
        [
          10,
          11,
          12,
          10.0,
          11.0,
          12.0,
          10n,
          11n,
          12n,
          '10',
          '11',
          '12',
          '10.0',
          '11.0',
          '12.0',
          ' 10 ',
          ' 11 ',
          ' 12 ',
        ],
        getReceived
      );
      const date4 = new Date(1);
      expectActionIssue(
        notValues([date4], 'message'),
        { ...baseInfo, expected: `!${date4.toJSON()}`, requirement: [date4] },
        [1, 1.0, 1n, '1', '1.0', ' 1 ', true],
        getReceived
      );
      const date5 = new Date(0);
      expectActionIssue(
        notValues([date5], 'message'),
        { ...baseInfo, expected: `!${date5.toJSON()}`, requirement: [date5] },
        [0, 0.0, 0n, '0', '0.0', ' 0 ', '', ' ', false],
        getReceived
      );
    });

    test('for invalid numbers', () => {
      expectActionIssue(
        notValues([-2, 3], 'message'),
        { ...baseInfo, expected: '!(-2 | 3)', requirement: [-2, 3] },
        [-2, 3, -2.0, 3.0]
      );

      expectActionIssue(
        notValues([0], 'message'),
        { ...baseInfo, expected: '!0', requirement: [0] },
        [-0, 0.0, 0]
      );
    });

    test('for invalid non-numbers', () => {
      expectActionIssue(
        notValues([10, 11, 12], 'message'),
        { ...baseInfo, expected: '!(10 | 11 | 12)', requirement: [10, 11, 12] },
        [
          10n,
          11n,
          12n,
          '10',
          '11',
          '12',
          '10.0',
          '11.0',
          '12.0',
          ' 10 ',
          ' 11 ',
          ' 12 ',
          new Date(10),
          new Date(11),
          new Date(12),
        ],
        getReceived
      );
      expectActionIssue(
        notValues([1], 'message'),
        { ...baseInfo, expected: '!1', requirement: [1] },
        [1n, '1', '1.0', ' 1 ', true, new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValues([0], 'message'),
        { ...baseInfo, expected: '!0', requirement: [0] },
        [0n, '0', '0.0', ' 0 ', '', ' ', false, new Date(0)],
        getReceived
      );
    });

    test('for invalid strings', () => {
      expectActionIssue(
        notValues(['2024', '2025'], 'message'),
        {
          ...baseInfo,
          expected: '!("2024" | "2025")',
          requirement: ['2024', '2025'],
        },
        ['2024', '2025']
      );

      expectActionIssue(
        notValues(['0'], 'message'),
        {
          ...baseInfo,
          expected: '!"0"',
          requirement: ['0'],
        },
        ['0']
      );
    });

    test('for invalid non-strings', () => {
      expectActionIssue(
        notValues(['10', '11', '12'], 'message'),
        {
          ...baseInfo,
          expected: '!("10" | "11" | "12")',
          requirement: ['10', '11', '12'],
        },
        [
          10n,
          11n,
          12n,
          10,
          11,
          12,
          10.0,
          11.0,
          12.0,
          new Date(10),
          new Date(11),
          new Date(12),
        ],
        getReceived
      );
      expectActionIssue(
        notValues(['1'], 'message'),
        { ...baseInfo, expected: '!"1"', requirement: ['1'] },
        [1n, 1, 1.0, true, new Date(1)],
        getReceived
      );
      expectActionIssue(
        notValues(['0'], 'message'),
        { ...baseInfo, expected: '!"0"', requirement: ['0'] },
        [0n, 0, 0.0, false, new Date(0)],
        getReceived
      );
    });
  });
});
