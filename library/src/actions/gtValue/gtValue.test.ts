import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { _stringify } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { gtValue, type GtValueAction } from './gtValue.ts';

describe('gtValue', () => {
  describe('should return action object', () => {
    const baseAction: Omit<GtValueAction<number, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'gt_value',
      reference: gtValue,
      expects: '>5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: GtValueAction<number, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(gtValue(5)).toStrictEqual(action);
      expect(gtValue(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(gtValue(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies GtValueAction<number, 5, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(gtValue(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies GtValueAction<number, 5, typeof message>);
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
        gtValue(1)['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({ typed: false, value: null, issues });
    });

    test('for valid bigints', () => {
      expectNoActionIssue(gtValue(1n), [2n, 9999n]);
    });

    test('for valid non-bigints', () => {
      expectNoActionIssue(gtValue(10n), [
        ' 11 ',
        '+11',
        '11',
        10.5,
        11,
        11.0,
        Infinity,
        new Date(11),
        new Date(11.5),
      ]);

      expectNoActionIssue(gtValue(1n), [
        ' 2 ',
        '+2',
        '2',
        1.5,
        2,
        2.0,
        Infinity,
        new Date(2),
        new Date(2.5),
      ]);

      expectNoActionIssue(gtValue(0n), [
        ' 1 ',
        '+1',
        '1',
        0.5,
        1,
        1.5,
        Infinity,
        true,
        new Date(1),
      ]);

      expectNoActionIssue(gtValue(-1n), [
        ' 0 ',
        '+0',
        '0',
        -0.5,
        0,
        0.5,
        Infinity,
        true,
        false,
        new Date(0),
      ]);
    });

    test('for valid booleans', () => {
      expectNoActionIssue(gtValue(false), [true]);
    });

    test('for valid non-booleans', () => {
      expectNoActionIssue(gtValue(true), [
        '1.5',
        '2',
        '99',
        '+1.5',
        '+2',
        '+99',
        '1.5',
        '2.0',
        '99.9',
        ' 1.5 ',
        ' 2 ',
        ' 99 ',
        1.5,
        2,
        99,
        Infinity,
        new Date(2),
        new Date(99),
        2n,
        99n,
      ]);

      expectNoActionIssue(gtValue(false), [
        '0.5',
        '1',
        '99',
        '+0.5',
        '+1',
        '+99',
        '0.5',
        '1.0',
        '99.9',
        ' 0.5 ',
        ' 1 ',
        ' 99 ',
        0.5,
        1,
        99,
        Infinity,
        new Date(1),
        new Date(99),
        1n,
        99n,
      ]);
    });

    test('for valid dates', () => {
      const date = new Date();
      expectNoActionIssue(gtValue(date), [
        new Date(+date + 1),
        new Date(+date + 999999),
      ]);
    });

    test('for valid non-dates', () => {
      expectNoActionIssue(gtValue(new Date(10)), [
        ' 10.5 ',
        '+10.5',
        '10.5',
        '11',
        '11.0',
        10.5,
        11,
        11.0,
        Infinity,
        11n,
      ]);

      expectNoActionIssue(gtValue(new Date(1)), [
        ' 1.5 ',
        '+1.5 ',
        '1.5',
        '2',
        '2.0',
        1.5,
        2,
        2.0,
        Infinity,
        2n,
      ]);

      expectNoActionIssue(gtValue(new Date(0)), [
        ' 0.5 ',
        '+0.5',
        '0.5',
        '1',
        '+1',
        '1.0',
        ' 1 ',
        0.5,
        1,
        1.0,
        Infinity,
        true,
        1n,
      ]);

      expectNoActionIssue(gtValue(new Date(-1)), [
        '',
        ' ',
        '0',
        '1',
        '-0.5',
        '0.0',
        '1.0',
        ' -0.5 ',
        ' 0 ',
        ' 1 ',
        0,
        -0,
        1,
        -0.5,
        0.0,
        1.0,
        Infinity,
        false,
        true,
        0n,
        1n,
      ]);
    });

    test('for valid numbers', () => {
      expectNoActionIssue(gtValue(10), [10.5, 11, 9999, Number.MAX_VALUE]);
    });

    test('for valid non-numbers', () => {
      expectNoActionIssue(gtValue(10), [
        ' 10.5 ',
        '+10.5',
        '10.5',
        '11',
        '99.99',
        new Date(11),
        new Date(99),
        11n,
        99n,
      ]);

      expectNoActionIssue(gtValue(1), [
        ' 1.5 ',
        '+1.5 ',
        '1.5',
        '2',
        '2.0',
        new Date(2),
        2n,
      ]);

      expectNoActionIssue(gtValue(0), [
        ' 0.5 ',
        '+0.5',
        '0.5',
        '1',
        '+1',
        '1.0',
        ' 1 ',
        true,
        new Date(1),
        1n,
      ]);

      expectNoActionIssue(gtValue(-1), [
        '',
        ' ',
        ' -0.5 ',
        '-0.5',
        '-0',
        '0',
        '+0',
        '0.0',
        ' 0 ',
        true,
        false,
        new Date(0),
        0n,
      ]);
    });

    test('for valid strings', () => {
      expectNoActionIssue(gtValue('2024'), ['2024.', '2025', '9999', 'XYZ']);
    });

    test('for valid non-strings', () => {
      expectNoActionIssue(gtValue('10'), [
        10.5,
        11,
        99.99,
        Infinity,
        new Date(11),
        new Date(99),
        11n,
        99n,
      ]);

      expectNoActionIssue(gtValue('1'), [
        1.5,
        2,
        2.0,
        Infinity,
        new Date(2),
        2n,
      ]);

      expectNoActionIssue(gtValue('0'), [
        0.5,
        1,
        1.0,
        Infinity,
        true,
        new Date(1),
        1n,
      ]);

      expectNoActionIssue(gtValue('-1'), [
        -0.5,
        0,
        0.0,
        Infinity,
        true,
        false,
        new Date(0),
        0n,
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'gt_value',
      message: 'message',
    } as const;

    const getReceived = (value: unknown): string =>
      value instanceof Date ? value.toJSON() : _stringify(value);

    test('for invalid bigints', () => {
      expectActionIssue(
        gtValue(10n, 'message'),
        { ...baseInfo, expected: '>10', requirement: 10n },
        [-9999n, 0n, 9n, 10n]
      );
    });

    test('for invalid non-bigints', () => {
      expectActionIssue(
        gtValue(123n, 'message'),
        { ...baseInfo, expected: '>123', requirement: 123n },
        [
          'nan',
          '124px',
          '+ 124',
          '-124',
          '',
          ' ',
          '0.0',
          '123',
          ' 123 ',
          '123.4',
          -123,
          0,
          123,
          123.0,
          NaN,
          false,
          true,
          new Date(-123),
          new Date(0),
          new Date(123),
        ],
        getReceived
      );

      expectActionIssue(
        gtValue(1n, 'message'),
        { ...baseInfo, expected: '>1', requirement: 1n },
        [
          'nan',
          '2px',
          '+ 2',
          '-1',
          '',
          '0',
          '1',
          '1.0',
          '1.5',
          -1,
          1,
          1.0,
          NaN,
          false,
          true,
          new Date(-1),
          new Date(0),
          new Date(1),
        ],
        getReceived
      );

      expectActionIssue(
        gtValue(0n, 'message'),
        { ...baseInfo, expected: '>0', requirement: 0n },
        [
          'nan',
          '1px',
          '+ 1',
          '-1',
          '',
          '0',
          '0.0',
          '0.5',
          -1,
          0,
          0.0,
          NaN,
          false,
          new Date(-1),
          new Date(0),
        ],
        getReceived
      );
    });

    test('for invalid booleans', () => {
      expectActionIssue(
        gtValue(false, 'message'),
        { ...baseInfo, expected: '>false', requirement: false },
        [false]
      );

      expectActionIssue(
        gtValue(true, 'message'),
        { ...baseInfo, expected: '>true', requirement: true },
        [false, true]
      );
    });

    test('for invalid non-booleans', () => {
      expectActionIssue(
        gtValue(false, 'message'),
        { ...baseInfo, expected: '>false', requirement: false },
        [
          'nan',
          '1px',
          '+ 1',
          '-1',
          '',
          '0',
          '0.0',
          -1,
          0,
          0.0,
          NaN,
          new Date(-1),
          new Date(0),
          -1n,
          0n,
        ],
        getReceived
      );

      expectActionIssue(
        gtValue(true, 'message'),
        { ...baseInfo, expected: '>true', requirement: true },
        [
          'nan',
          '2px',
          '+ 2',
          '-2',
          '',
          '0',
          '1',
          '1.0',
          -1,
          1,
          1.0,
          NaN,
          new Date(-1),
          new Date(0),
          new Date(1),
          -1n,
          0n,
          1n,
        ],
        getReceived
      );
    });

    test('for invalid dates', () => {
      const date = new Date();
      expectActionIssue(
        gtValue<Date, Date, 'message'>(date, 'message'),
        { ...baseInfo, expected: `>${date.toJSON()}`, requirement: date },
        [date, new Date(0), new Date(+date - 999999), new Date(+date - 1)],
        (value) => value.toJSON()
      );
    });

    test('for invalid non-dates', () => {
      const date1 = new Date(123);
      expectActionIssue(
        gtValue(date1, 'message'),
        { ...baseInfo, expected: `>${date1.toJSON()}`, requirement: date1 },
        [
          'nan',
          '124px',
          '+ 124',
          '-124',
          '',
          '123',
          '123.0',
          -124,
          0,
          123,
          123.0,
          NaN,
          false,
          true,
          -124n,
          0n,
          123n,
        ],
        getReceived
      );

      const date2 = new Date(1);
      expectActionIssue(
        gtValue(date2, 'message'),
        { ...baseInfo, expected: `>${date2.toJSON()}`, requirement: date2 },
        [
          'nan',
          '2px',
          '+ 2',
          '-2',
          '',
          '0',
          '1',
          '1.0',
          -2,
          1,
          1.0,
          NaN,
          false,
          true,
          -2n,
          0n,
          1n,
        ],
        getReceived
      );

      const date3 = new Date(0);
      expectActionIssue(
        gtValue(date3, 'message'),
        { ...baseInfo, expected: `>${date3.toJSON()}`, requirement: date3 },
        [
          'nan',
          '1px',
          '+ 1',
          '-1',
          '',
          '0',
          '0.0',
          -1,
          0,
          0.0,
          NaN,
          false,
          -1n,
          0n,
        ],
        getReceived
      );
    });

    test('for invalid numbers', () => {
      expectActionIssue(
        gtValue(10, 'message'),
        { ...baseInfo, expected: '>10', requirement: 10 },
        [Number.MIN_VALUE, 0, 9, 10, NaN]
      );
    });

    test('for invalid non-numbers', () => {
      expectActionIssue(
        gtValue(123, 'message'),
        { ...baseInfo, expected: '>123', requirement: 123 },
        [
          'nan',
          '124px',
          '+ 124',
          '-124',
          '',
          '123',
          '123.0',
          false,
          true,
          new Date(-123),
          new Date(0),
          new Date(123),
          -123n,
          0n,
          123n,
        ],
        getReceived
      );

      expectActionIssue(
        gtValue(1, 'message'),
        { ...baseInfo, expected: '>1', requirement: 1 },
        [
          'nan',
          '2px',
          '+ 2',
          '-1',
          '',
          '0',
          '1',
          '1.0',
          false,
          true,
          new Date(-1),
          new Date(0),
          new Date(1),
          -1n,
          0n,
          1n,
        ],
        getReceived
      );

      expectActionIssue(
        gtValue(0, 'message'),
        { ...baseInfo, expected: '>0', requirement: 0 },
        [
          'nan',
          '1px',
          '+ 1',
          '-1',
          '',
          ' ',
          '0',
          '0.0',
          false,
          new Date(-1),
          new Date(0),
          -1n,
          0n,
        ],
        getReceived
      );
    });

    test('for invalid strings', () => {
      expectActionIssue(
        gtValue('2024', 'message'),
        { ...baseInfo, expected: '>"2024"', requirement: '2024' },
        ['', '1234', '2024']
      );
    });

    test('for invalid non-strings', () => {
      expectActionIssue(
        gtValue('123', 'message'),
        { ...baseInfo, expected: '>"123"', requirement: '123' },
        [
          -123,
          0,
          123,
          123.0,
          NaN,
          false,
          true,
          new Date(-123),
          new Date(0),
          new Date(123),
          -123n,
          0n,
          123n,
        ],
        getReceived
      );

      expectActionIssue(
        gtValue('1', 'message'),
        { ...baseInfo, expected: '>"1"', requirement: '1' },
        [
          -1,
          1,
          1.0,
          NaN,
          false,
          true,
          new Date(-1),
          new Date(0),
          new Date(1),
          new Date(1.5),
          -1n,
          0n,
          1n,
        ],
        getReceived
      );

      expectActionIssue(
        gtValue('0', 'message'),
        { ...baseInfo, expected: '>"0"', requirement: '0' },
        [
          -1,
          0,
          0.0,
          NaN,
          false,
          new Date(-1),
          new Date(0),
          new Date(0.5),
          -1n,
          0n,
        ],
        getReceived
      );
    });
  });
});
