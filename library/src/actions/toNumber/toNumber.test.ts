import { describe, expect, test } from 'vitest';
import {
  toNumber,
  type ToNumberAction,
  type ToNumberIssue,
} from './toNumber.ts';

describe('toNumber', () => {
  describe('should return action object', () => {
    test('without message', () => {
      expect(toNumber()).toStrictEqual({
        kind: 'transformation',
        type: 'to_number',
        reference: toNumber,
        async: false,
        message: undefined,
        '~run': expect.any(Function),
      } satisfies ToNumberAction<unknown, undefined>);
    });

    test('with message', () => {
      expect(toNumber('message')).toStrictEqual({
        kind: 'transformation',
        type: 'to_number',
        reference: toNumber,
        async: false,
        message: 'message',
        '~run': expect.any(Function),
      } satisfies ToNumberAction<unknown, string>);
    });
  });

  describe('should transform to number', () => {
    const action = toNumber();

    test('for string', () => {
      expect(action['~run']({ typed: true, value: '123' }, {})).toStrictEqual({
        typed: true,
        value: 123,
      });
    });

    test('for number', () => {
      expect(action['~run']({ typed: true, value: 123 }, {})).toStrictEqual({
        typed: true,
        value: 123,
      });
    });

    test('for bigint', () => {
      expect(action['~run']({ typed: true, value: 123n }, {})).toStrictEqual({
        typed: true,
        value: 123,
      });
    });

    test('for boolean', () => {
      expect(action['~run']({ typed: true, value: true }, {})).toStrictEqual({
        typed: true,
        value: 1,
      });
    });

    test('for null', () => {
      expect(action['~run']({ typed: true, value: null }, {})).toStrictEqual({
        typed: true,
        value: 0,
      });
    });
  });
  describe('should return dataset with issues', () => {
    const action = toNumber();
    const baseIssue: Omit<
      ToNumberIssue<number>,
      'input' | 'received' | 'message'
    > = {
      kind: 'transformation',
      type: 'to_number',
      expected: null,
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    // Primitive types

    test('for undefined', () => {
      const value = undefined;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
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
            message: 'Invalid number: Received symbol',
          },
        ],
      });
    });

    // Invalid strings

    test('for invalid strings', () => {
      const value = 'abc';
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
          },
        ],
      });
    });

    test('for partially numeric strings', () => {
      const value = '123abc';
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
          },
        ],
      });
    });

    // Complex types

    test('for arrays with multiple elements', () => {
      const value = [1, 2];
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
          },
        ],
      });
    });

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const value = () => {};
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
          },
        ],
      });
    });

    test('for objects', () => {
      const value = {};
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
          },
        ],
      });
    });

    test('for invalid dates', () => {
      const value = new Date('invalid');
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: NaN,
        issues: [
          {
            ...baseIssue,
            input: NaN,
            received: 'NaN',
            message: 'Invalid number: Received NaN',
          },
        ],
      });
    });
  });
});
