import { describe, expect, test } from 'vitest';
import { toBoolean, type ToBooleanAction } from './toBoolean.ts';

describe('toBoolean', () => {
  test('should return action object', () => {
    expect(toBoolean()).toStrictEqual({
      kind: 'transformation',
      type: 'to_boolean',
      reference: toBoolean,
      async: false,
      '~run': expect.any(Function),
    } satisfies ToBooleanAction<unknown>);
  });

  describe('should transform to boolean', () => {
    const action = toBoolean();

    // Falsy values

    test('for empty strings', () => {
      expect(action['~run']({ typed: true, value: '' }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for zeros', () => {
      expect(action['~run']({ typed: true, value: 0 }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
      expect(action['~run']({ typed: true, value: -0 }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
      expect(action['~run']({ typed: true, value: 0n }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for NaN numbers', () => {
      expect(action['~run']({ typed: true, value: NaN }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for false booleans', () => {
      expect(action['~run']({ typed: true, value: false }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for null', () => {
      expect(action['~run']({ typed: true, value: null }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for undefined', () => {
      expect(
        action['~run']({ typed: true, value: undefined }, {})
      ).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    // Truthy values

    test('for non-empty strings', () => {
      expect(action['~run']({ typed: true, value: 'foo' }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(action['~run']({ typed: true, value: '0' }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(action['~run']({ typed: true, value: 'false' }, {})).toStrictEqual(
        {
          typed: true,
          value: true,
        }
      );
    });

    test('for non-zero numbers', () => {
      expect(action['~run']({ typed: true, value: 1 }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(action['~run']({ typed: true, value: -1 }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(
        action['~run']({ typed: true, value: Infinity }, {})
      ).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(
        action['~run']({ typed: true, value: -Infinity }, {})
      ).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for non-zero bigints', () => {
      expect(action['~run']({ typed: true, value: 1n }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(action['~run']({ typed: true, value: -1n }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for true booleans', () => {
      expect(action['~run']({ typed: true, value: true }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for symbols', () => {
      expect(
        action['~run']({ typed: true, value: Symbol() }, {})
      ).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(
        action['~run']({ typed: true, value: Symbol('foo') }, {})
      ).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for arrays', () => {
      expect(action['~run']({ typed: true, value: [] }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(action['~run']({ typed: true, value: [0] }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(action['~run']({ typed: true, value: ['foo'] }, {})).toStrictEqual(
        {
          typed: true,
          value: true,
        }
      );
    });

    test('for functions', () => {
      expect(
        action['~run'](
          {
            typed: true,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            value: () => {},
          },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(
        action['~run'](
          {
            typed: true,
            value:
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              function () {},
          },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for objects', () => {
      expect(action['~run']({ typed: true, value: {} }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
      expect(
        action['~run']({ typed: true, value: { key: 'value' } }, {})
      ).toStrictEqual({
        typed: true,
        value: true,
      });
    });
  });
});
