import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getDigitCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  maxDigitChars,
  type MaxDigitCharsAction,
  type MaxDigitCharsIssue,
} from './maxDigitChars.ts';

describe('maxDigitChars', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MaxDigitCharsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'max_digit_chars',
      reference: maxDigitChars,
      expects: '<=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxDigitCharsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(maxDigitChars(5)).toStrictEqual(action);
      expect(maxDigitChars(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxDigitChars(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MaxDigitCharsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxDigitChars(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MaxDigitCharsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = maxDigitChars(5);

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
      expectNoActionIssue(action, [
        '',
        'foo',
        '12345',
        'abc1234',
        'a1b2c3d4e5',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = maxDigitChars(5, 'message');
    const baseIssue: Omit<
      MaxDigitCharsIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'max_digit_chars',
      expected: '<=5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['123456', 'foo123bar456', '1234567890'],
        (value) => `${_getDigitCount(value)}`
      );
    });
  });
});
