import { describe, expect, test } from 'vitest';
import { toDate, type ToDateAction, type ToDateIssue } from './toDate.ts';

describe('toDate', () => {
  describe('should return action object', () => {
    test('without message', () => {
      expect(toDate()).toStrictEqual({
        kind: 'transformation',
        type: 'to_date',
        reference: toDate,
        async: false,
        message: undefined,
        '~run': expect.any(Function),
      } satisfies ToDateAction<string, undefined>);
    });

    test('with message', () => {
      expect(toDate('message')).toStrictEqual({
        kind: 'transformation',
        type: 'to_date',
        reference: toDate,
        async: false,
        message: 'message',
        '~run': expect.any(Function),
      } satisfies ToDateAction<string, string>);
    });
  });

  describe('should transform to date', () => {
    const action = toDate();

    test('for string', () => {
      expect(
        action['~run']({ typed: true, value: '2024-05-06' }, {})
      ).toStrictEqual({
        typed: true,
        value: expect.any(Date),
      });
    });

    test('for number', () => {
      expect(
        action['~run']({ typed: true, value: 1714924800000 }, {})
      ).toStrictEqual({
        typed: true,
        value: expect.any(Date),
      });
    });

    test('for date', () => {
      const date = new Date();
      expect(action['~run']({ typed: true, value: date }, {})).toStrictEqual({
        typed: true,
        value: date,
      });
    });
  });
  describe('should return dataset with issues', () => {
    const action = toDate();
    const invalidDate = new Date('invalid');
    const baseIssue: Omit<
      ToDateIssue<number>,
      'input' | 'received' | 'message'
    > = {
      kind: 'transformation',
      type: 'to_date',
      expected: null,
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    // Primitive types

    test('for bigints', () => {
      const value = 123n;
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value,
        issues: [
          {
            ...baseIssue,
            input: value,
            received: '123',
            message: 'Invalid date: Received 123',
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
            message: 'Invalid date: Received symbol',
          },
        ],
      });
    });

    // Invalid strings

    test('for invalid date strings', () => {
      const value = 'invalid';
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: invalidDate,
        issues: [
          {
            ...baseIssue,
            input: invalidDate,
            received: '"Invalid Date"',
            message: 'Invalid date: Received "Invalid Date"',
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
        value: invalidDate,
        issues: [
          {
            ...baseIssue,
            input: invalidDate,
            received: '"Invalid Date"',
            message: 'Invalid date: Received "Invalid Date"',
          },
        ],
      });
    });

    test('for objects', () => {
      const value = {};
      expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
        typed: false,
        value: invalidDate,
        issues: [
          {
            ...baseIssue,
            input: invalidDate,
            received: '"Invalid Date"',
            message: 'Invalid date: Received "Invalid Date"',
          },
        ],
      });
    });
  });
});
