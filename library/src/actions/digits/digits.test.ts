import { describe, expect, test } from 'vitest';
import { DIGITS_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { digits, type DigitsAction, type DigitsIssue } from './digits.ts';

describe('digits', () => {
  describe('should return action object', () => {
    const baseAction: Omit<DigitsAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'digits',
      reference: digits,
      expects: null,
      requirement: DIGITS_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: DigitsAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(digits()).toStrictEqual(action);
      expect(digits(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(digits('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies DigitsAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(digits(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies DigitsAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = digits();

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

    test('for a single digit', () => {
      const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      expectNoActionIssue(action, values);
    });

    test('for two digits', () => {
      expectNoActionIssue(action, ['00', '01', '12', '99']);
    });

    test('for multiple digits', () => {
      expectNoActionIssue(action, ['0123456789']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = digits('message');
    const baseIssue: Omit<DigitsIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'digits',
      expected: null,
      message: 'message',
      requirement: DIGITS_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [' 1', '1 ', ' 1 ', '1 2']);
    });

    test('for number separators', () => {
      expectActionIssue(action, baseIssue, ['1,000', '1_000', '1 000']);
    });

    test('for number signs', () => {
      expectActionIssue(action, baseIssue, ['+1', '-1', '+123', '-123']);
    });

    test('for float numbers', () => {
      expectActionIssue(action, baseIssue, ['0.1', '123.456']);
    });

    test('for exponential numbers', () => {
      expectActionIssue(action, baseIssue, ['1e3', '1e-3', '1e+3']);
    });

    test('for word chars', () => {
      expectActionIssue(action, baseIssue, ['a', 'A', 'abc', 'ABC']);
    });

    test('for special chars', () => {
      expectActionIssue(action, baseIssue, [
        '-',
        '-1',
        '+',
        '+1',
        '#',
        '#1',
        '$',
        '$1',
        '%',
        '1%',
      ]);
    });
  });
});
