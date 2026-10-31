import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getDigitCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  digitChars,
  type DigitCharsAction,
  type DigitCharsIssue,
} from './digitChars.ts';

describe('digitChars', () => {
  describe('should return action object', () => {
    const baseAction: Omit<DigitCharsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'digit_chars',
      reference: digitChars,
      expects: '5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: DigitCharsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(digitChars(5)).toStrictEqual(action);
      expect(digitChars(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(digitChars(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies DigitCharsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(digitChars(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies DigitCharsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = digitChars(5);

    test('for untyped inputs', () => {
      const issues: [StringIssue] = [
        {
          kind: 'schema',
          type: 'string',
          input: null,
          expected: 'string',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid strings', () => {
      expectNoActionIssue(action, ['12345', 'a1b2c3d4e5', 'foo12345bar']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = digitChars(5, 'message');
    const baseIssue: Omit<DigitCharsIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'digit_chars',
      expected: '5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['', 'foo', '1234', '123456', 'abc123456'],
        (value) => `${_getDigitCount(value)}`
      );
    });
  });
});
