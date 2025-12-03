import { describe, expect, test } from 'vitest';
import {
  toString,
  type ToStringAction,
  type ToStringIssue,
} from './toString.ts';

describe('toString', () => {
  describe('should return action object', () => {
    test('without message', () => {
      expect(toString()).toStrictEqual({
        kind: 'transformation',
        type: 'to_string',
        reference: toString,
        async: false,
        message: undefined,
        '~run': expect.any(Function),
      } satisfies ToStringAction<unknown, undefined>);
    });

    test('with message', () => {
      expect(toString('message')).toStrictEqual({
        kind: 'transformation',
        type: 'to_string',
        reference: toString,
        async: false,
        message: 'message',
        '~run': expect.any(Function),
      } satisfies ToStringAction<unknown, string>);
    });
  });

  describe('should transform to string', () => {
    const action = toString();

    test('for string', () => {
      expect(action['~run']({ typed: true, value: 'foo' }, {})).toStrictEqual({
        typed: true,
        value: 'foo',
      });
    });

    test('for number', () => {
      expect(action['~run']({ typed: true, value: 123 }, {})).toStrictEqual({
        typed: true,
        value: '123',
      });
    });

    test('for bigint', () => {
      expect(action['~run']({ typed: true, value: 123n }, {})).toStrictEqual({
        typed: true,
        value: '123',
      });
    });

    test('for boolean', () => {
      expect(action['~run']({ typed: true, value: true }, {})).toStrictEqual({
        typed: true,
        value: 'true',
      });
    });

    test('for null', () => {
      expect(action['~run']({ typed: true, value: null }, {})).toStrictEqual({
        typed: true,
        value: 'null',
      });
    });

    test('for undefined', () => {
      expect(
        action['~run']({ typed: true, value: undefined }, {})
      ).toStrictEqual({
        typed: true,
        value: 'undefined',
      });
    });

    test('for symbol', () => {
      expect(
        action['~run']({ typed: true, value: Symbol('foo') }, {})
      ).toStrictEqual({
        typed: true,
        value: 'Symbol(foo)',
      });
    });
  });
  describe('should return dataset with issues', () => {
    const action = toString();
    const baseIssue: Omit<
      ToStringIssue<number>,
      'input' | 'received' | 'message'
    > = {
      kind: 'transformation',
      type: 'to_string',
      expected: null,
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for objects with faulty toString', () => {
      const faultyToString = {
        toString() {
          throw new Error('oops');
        },
      };
      expect(
        action['~run']({ typed: true, value: faultyToString }, {})
      ).toStrictEqual({
        typed: false,
        value: faultyToString,
        issues: [
          {
            ...baseIssue,
            input: faultyToString,
            received: 'Object',
            message: 'Invalid string: Received Object',
          },
        ],
      });
    });
  });
});
