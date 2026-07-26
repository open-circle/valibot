import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { _stringify } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ltValue, type LtValueAction } from './ltValue.ts';

describe('ltValue', () => {
  describe('should return action object', () => {
    const baseAction: Omit<LtValueAction<number, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'lt_value',
      reference: ltValue,
      expects: '<5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: LtValueAction<number, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(ltValue(5)).toStrictEqual(action);
      expect(ltValue(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(ltValue(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies LtValueAction<number, 5, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(ltValue(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies LtValueAction<number, 5, typeof message>);
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
        ltValue(1)['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({ typed: false, value: null, issues });
    });

    test('for valid bigints', () => {
      expectNoActionIssue(ltValue(10n), [-9999n, 0n, 9n]);
    });

    test('for valid non-bigints', () => {
      expectNoActionIssue(ltValue(10n), [
        '-10',
        '',
        ' ',
        '0',
        '9',
        ' 9 ',
        -10,
        0,
        9,
        -Infinity,
        -10.0,
        0.0,
        9.0,
        9.5,
        false,
        true,
        new Date(-10),
        new Date(0),
        new Date(9),
      ]);

      expectNoActionIssue(ltValue(1n), [
        '-1',
        '',
        ' ',
        ' 0 ',
        '0',
        -1,
        0.0,
        0,
        0.5,
        -Infinity,
        false,
        new Date(-1),
        new Date(0),
      ]);

      expectNoActionIssue(ltValue(0n), [
        '-1',
        ' -1 ',
        -0.5,
        -1,
        -1.0,
        -Infinity,
        new Date(-1),
      ]);
    });

    test('for valid booleans', () => {
      expectNoActionIssue(ltValue(true), [false]);
    });

    test('for valid non-booleans', () => {
      expectNoActionIssue(ltValue(true), [
        '-1',
        ' 0 ',
        '0',
        '0.5',
        -1,
        0.0,
        0,
        0.5,
        -Infinity,
        new Date(-1),
        new Date(0),
        -1n,
        0n,
      ]);

      expectNoActionIssue(ltValue(false), [
        '-1',
        ' -1 ',
        '-0.5',
        -0.5,
        -1,
        -1.0,
        -Infinity,
        new Date(-1),
        -1n,
      ]);
    });

    test('for valid dates', () => {
      const date = new Date();
      expectNoActionIssue(ltValue(date), [
        new Date(0),
        new Date(+date - 999999),
        new Date(+date - 1),
      ]);
    });

    test('for valid non-dates', () => {
      const date1 = new Date(10);
      expectNoActionIssue(ltValue(date1), [
        '-10',
        ' 9 ',
        '9',
        '9.5',
        9.5,
        9,
        9.0,
        -Infinity,
        false,
        true,
        -10n,
        0n,
        9n,
      ]);

      const date2 = new Date(1);
      expectNoActionIssue(ltValue(date2), [
        '-1',
        '',
        ' ',
        ' 0 ',
        '0',
        '0.5',
        -1,
        0.0,
        0,
        0.5,
        -Infinity,
        false,
        -1n,
        0n,
      ]);

      const date3 = new Date(0);
      expectNoActionIssue(ltValue(date3), [
        '-1',
        ' -1 ',
        '-0.5',
        -0.5,
        -1,
        -1.0,
        -Infinity,
        -1n,
      ]);
    });

    test('for valid numbers', () => {
      expectNoActionIssue(ltValue(10), [Number.MIN_VALUE, 0, 9, 9.5]);
    });

    test('for valid non-numbers', () => {
      expectNoActionIssue(ltValue(10), [
        '-10',
        ' 9 ',
        '9',
        '9.5',
        '',
        ' ',
        false,
        true,
        new Date(-10),
        new Date(0),
        new Date(9),
        -10n,
        0n,
        9n,
      ]);

      expectNoActionIssue(ltValue(1), [
        '-1',
        ' 0 ',
        '0',
        '0.5',
        '',
        ' ',
        false,
        new Date(-1),
        new Date(0),
        -1n,
        0n,
      ]);

      expectNoActionIssue(ltValue(0), [
        '-1',
        ' -1 ',
        '-0.5',
        new Date(-1),
        -1n,
      ]);
    });

    test('for valid strings', () => {
      expectNoActionIssue(ltValue('2024'), ['', '1234', '2023']);
    });

    test('for valid non-strings', () => {
      expectNoActionIssue(ltValue('10'), [
        -10,
        0,
        9.5,
        9,
        9.0,
        -Infinity,
        false,
        true,
        new Date(-10),
        new Date(0),
        new Date(9),
        -10n,
        0n,
        9n,
      ]);

      expectNoActionIssue(ltValue('1'), [
        -1,
        0,
        0.5,
        -Infinity,
        false,
        new Date(-1),
        new Date(0),
        -1n,
        0n,
      ]);

      expectNoActionIssue(ltValue('0'), [
        -0.5,
        -1,
        -1.0,
        -Infinity,
        new Date(-1),
        -1n,
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'lt_value',
      message: 'message',
    } as const;

    const getReceived = (value: unknown): string =>
      value instanceof Date ? value.toJSON() : _stringify(value);

    test('for invalid bigints', () => {
      expectActionIssue(
        ltValue(10n, 'message'),
        { ...baseInfo, expected: '<10', requirement: 10n },
        [10n, 11n, 9999n]
      );
    });

    test('for invalid non-bigints', () => {
      expectActionIssue(
        ltValue(123n, 'message'),
        { ...baseInfo, expected: '<123', requirement: 123n },
        [
          'nan',
          '122px',
          '+ 122',
          '122.0',
          '123',
          '124',
          123,
          124,
          124.0,
          Infinity,
          NaN,
          new Date(123),
          new Date(124),
        ],
        getReceived
      );

      expectActionIssue(
        ltValue(1n, 'message'),
        { ...baseInfo, expected: '<1', requirement: 1n },
        [
          'nan',
          '0px',
          '+ 0',
          '0.0',
          '1',
          1,
          1.0,
          2,
          Infinity,
          NaN,
          true,
          new Date(1),
          new Date(2),
        ],
        getReceived
      );

      expectActionIssue(
        ltValue(0n, 'message'),
        { ...baseInfo, expected: '<0', requirement: 0n },
        [
          'nan',
          '-1px',
          '- 1',
          '-1.0',
          '0',
          0,
          0.0,
          1,
          1.0,
          Infinity,
          NaN,
          false,
          true,
          new Date(0),
          new Date(1),
        ],
        getReceived
      );
    });

    test('for invalid booleans', () => {
      expectActionIssue(
        ltValue(false, 'message'),
        { ...baseInfo, expected: '<false', requirement: false },
        [false, true]
      );

      expectActionIssue(
        ltValue(true, 'message'),
        { ...baseInfo, expected: '<true', requirement: true },
        [true]
      );
    });

    test('for invalid non-booleans', () => {
      expectActionIssue(
        ltValue(false, 'message'),
        { ...baseInfo, expected: '<false', requirement: false },
        [
          'nan',
          '-1px',
          '- 1',
          '0',
          '0.0',
          0,
          0.0,
          1,
          1.0,
          Infinity,
          NaN,
          new Date(0),
          new Date(1),
          0n,
          1n,
        ],
        getReceived
      );

      expectActionIssue(
        ltValue(true, 'message'),
        { ...baseInfo, expected: '<true', requirement: true },
        [
          'nan',
          '0px',
          '+ 0',
          '1',
          '1.0',
          1,
          1.0,
          2,
          Infinity,
          NaN,
          new Date(1),
          new Date(2),
          1n,
          2n,
        ],
        getReceived
      );
    });

    test('for invalid dates', () => {
      const date = new Date();
      expectActionIssue(
        ltValue<Date, Date, 'message'>(date, 'message'),
        { ...baseInfo, expected: `<${date.toJSON()}`, requirement: date },
        [date, new Date(+date + 1), new Date(+date + 999999)],
        (value) => value.toJSON()
      );
    });

    test('for invalid non-dates', () => {
      const date1 = new Date(123);
      expectActionIssue(
        ltValue(date1, 'message'),
        { ...baseInfo, expected: `<${date1.toJSON()}`, requirement: date1 },
        [
          'nan',
          '122px',
          '+ 122',
          '123',
          '124.0',
          123,
          124,
          124.0,
          Infinity,
          NaN,
          123n,
          124n,
        ],
        getReceived
      );

      const date2 = new Date(1);
      expectActionIssue(
        ltValue(date2, 'message'),
        { ...baseInfo, expected: `<${date2.toJSON()}`, requirement: date2 },
        [
          'nan',
          '0px',
          '+ 0',
          '1',
          '1.0',
          1,
          1.0,
          2,
          Infinity,
          NaN,
          true,
          1n,
          2n,
        ],
        getReceived
      );

      const date3 = new Date(0);
      expectActionIssue(
        ltValue(date3, 'message'),
        { ...baseInfo, expected: `<${date3.toJSON()}`, requirement: date3 },
        [
          'nan',
          '-1px',
          '- 1',
          '0',
          '0.0',
          0,
          0.0,
          1,
          1.0,
          Infinity,
          NaN,
          false,
          true,
          0n,
          1n,
        ],
        getReceived
      );
    });

    test('for invalid numbers', () => {
      expectActionIssue(
        ltValue(10, 'message'),
        { ...baseInfo, expected: '<10', requirement: 10 },
        [10, 11, 9999, Number.MAX_VALUE, NaN]
      );
    });

    test('for invalid non-numbers', () => {
      expectActionIssue(
        ltValue(123, 'message'),
        { ...baseInfo, expected: '<123', requirement: 123 },
        [
          'nan',
          '122px',
          '+ 122',
          '123',
          '124',
          '124.0',
          new Date(123),
          new Date(124),
          123n,
          124n,
        ],
        getReceived
      );

      expectActionIssue(
        ltValue(1, 'message'),
        { ...baseInfo, expected: '<1', requirement: 1 },
        [
          'nan',
          '0px',
          '+ 0',
          '1',
          '1.0',
          true,
          new Date(1),
          new Date(2),
          1n,
          2n,
        ],
        getReceived
      );

      expectActionIssue(
        ltValue(0, 'message'),
        { ...baseInfo, expected: '<0', requirement: 0 },
        [
          'nan',
          '-1px',
          '- 1',
          '0',
          '0.0',
          false,
          true,
          new Date(0),
          new Date(1),
          0n,
          1n,
        ],
        getReceived
      );
    });

    test('for invalid strings', () => {
      expectActionIssue(
        ltValue('2024', 'message'),
        { ...baseInfo, expected: '<"2024"', requirement: '2024' },
        ['2024', '2025', '9999', 'XYZ']
      );
    });

    test('for invalid non-strings', () => {
      expectActionIssue(
        ltValue('123', 'message'),
        { ...baseInfo, expected: '<"123"', requirement: '123' },
        [
          123,
          124,
          124.0,
          Infinity,
          NaN,
          new Date(123),
          new Date(124),
          123n,
          124n,
        ],
        getReceived
      );

      expectActionIssue(
        ltValue('1', 'message'),
        { ...baseInfo, expected: '<"1"', requirement: '1' },
        [1, 1.0, 2, Infinity, NaN, true, new Date(1), new Date(2), 1n, 2n],
        getReceived
      );

      expectActionIssue(
        ltValue('0', 'message'),
        { ...baseInfo, expected: '<"0"', requirement: '0' },
        [
          0,
          0.0,
          1,
          1.0,
          Infinity,
          NaN,
          false,
          true,
          new Date(0),
          new Date(1),
          0n,
          1n,
        ],
        getReceived
      );
    });
  });
});
