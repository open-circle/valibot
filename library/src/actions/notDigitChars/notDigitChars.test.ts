import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getDigitCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  notDigitChars,
  type NotDigitCharsAction,
  type NotDigitCharsIssue,
} from './notDigitChars.ts';

describe('notDigitChars', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NotDigitCharsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'not_digit_chars',
      reference: notDigitChars,
      expects: '!5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotDigitCharsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notDigitChars(5)).toStrictEqual(action);
      expect(notDigitChars(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notDigitChars(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotDigitCharsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notDigitChars(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotDigitCharsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = notDigitChars(5);

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
      expectNoActionIssue(action, ['', 'foo', '1234', '123456', 'abc123456']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = notDigitChars(5, 'message');
    const baseIssue: Omit<
      NotDigitCharsIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'not_digit_chars',
      expected: '!5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['12345', 'a1b2c3d4e5', 'foo12345bar'],
        (value) => `${_getDigitCount(value)}`
      );
    });
  });
});
