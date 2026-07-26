import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  maxLength,
  type MaxLengthAction,
  type MaxLengthIssue,
} from './maxLength.ts';

describe('maxLength', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MaxLengthAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'max_length',
      reference: maxLength,
      expects: '<=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxLengthAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(maxLength(5)).toStrictEqual(action);
      expect(maxLength(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxLength(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MaxLengthAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxLength(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MaxLengthAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = maxLength(5);

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
      expectNoActionIssue(action, ['', 'foo', '12345', '😀😀']);
    });

    test('for valid arrays', () => {
      expectNoActionIssue(action, [[], ['foo', 'bar'], [1, 2, 3, 4, 5]]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = maxLength(5, 'message');
    const baseIssue: Omit<MaxLengthIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'max_length',
      expected: '<=5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['123456', 'foobarbaz123', '😀😀😀'],
        (value) => `${value.length}`
      );
    });

    test('for invalid arrays', () => {
      expectActionIssue(
        action,
        baseIssue,
        [[1, 2, 3, 4, 5, 6], Array(999)],
        (value) => `${value.length}`
      );
    });
  });
});
