import { describe, expect, test } from 'vitest';
import {
  toBigint,
  type ToBigintAction,
  type ToBigintIssue,
} from './toBigint.ts';

describe('toBigint', () => {
  describe('should return action object', () => {
    test('without message', () => {
      expect(toBigint()).toStrictEqual({
        kind: 'transformation',
        type: 'to_bigint',
        reference: toBigint,
        async: false,
        message: undefined,
        '~run': expect.any(Function),
      } satisfies ToBigintAction<bigint, undefined>);
    });

    test('with message', () => {
      expect(toBigint('message')).toStrictEqual({
        kind: 'transformation',
        type: 'to_bigint',
        reference: toBigint,
        async: false,
        message: 'message',
        '~run': expect.any(Function),
      } satisfies ToBigintAction<bigint, string>);
    });
  });

  describe('should transform to bigint', () => {
    const action = toBigint();

    test('for string', () => {
      expect(action['~run']({ typed: true, value: '123' }, {})).toStrictEqual({
        typed: true,
        value: 123n,
      });
    });

    test('for number', () => {
      expect(action['~run']({ typed: true, value: 123 }, {})).toStrictEqual({
        typed: true,
        value: 123n,
      });
    });

    test('for bigint', () => {
      expect(action['~run']({ typed: true, value: 123n }, {})).toStrictEqual({
        typed: true,
        value: 123n,
      });
    });

    test('for boolean', () => {
      expect(action['~run']({ typed: true, value: true }, {})).toStrictEqual({
        typed: true,
        value: 1n,
      });
    });
  });
  describe('should return dataset with issues', () => {
    const action = toBigint();
    const baseIssue: Omit<
      ToBigintIssue<number>,
      'input' | 'received' | 'message'
    > = {
      kind: 'transformation',
      type: 'to_bigint',
      expected: null,
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    // Primitive types

    test('for null', () => {
      const value = null;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'null',
            message: 'Invalid bigint: Received null',
          },
        ],
      });
    });

    test('for numbers', () => {
      const value = 123.45;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: '123.45',
            message: 'Invalid bigint: Received 123.45',
          },
        ],
      });
    });

    test('for NaN', () => {
      const value = NaN;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'NaN',
            message: 'Invalid bigint: Received NaN',
          },
        ],
      });
    });

    test('for Infinity', () => {
      const value = Infinity;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'Infinity',
            message: 'Invalid bigint: Received Infinity',
          },
        ],
      });
    });

    test('for undefined', () => {
      const value = undefined;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'undefined',
            message: 'Invalid bigint: Received undefined',
          },
        ],
      });
    });

    test('for symbols', () => {
      const value = Symbol();
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'symbol',
            message: 'Invalid bigint: Received symbol',
          },
        ],
      });
    });

    // Invalid strings

    test('for decimal strings', () => {
      const value = '123.45';
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: '"123.45"',
            message: 'Invalid bigint: Received "123.45"',
          },
        ],
      });
    });

    test('for invalid strings', () => {
      const value = 'abc';
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: '"abc"',
            message: 'Invalid bigint: Received "abc"',
          },
        ],
      });
    });

    // Complex types

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const value = () => {};
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'Function',
            message: 'Invalid bigint: Received Function',
          },
        ],
      });
    });

    test('for objects', () => {
      const value = {};
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: 'Object',
            message: 'Invalid bigint: Received Object',
          },
        ],
      });
    });
  });
});
