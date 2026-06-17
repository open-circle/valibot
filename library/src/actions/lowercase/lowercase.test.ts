import { describe, expect, test } from 'vitest';
import { LOWERCASE_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  lowercase,
  type LowercaseAction,
  type LowercaseIssue,
} from './lowercase.ts';

describe('lowercase', () => {
  describe('should return action object', () => {
    const baseAction: Omit<LowercaseAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'lowercase',
      reference: lowercase,
      expects: null,
      requirement: LOWERCASE_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: LowercaseAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(lowercase()).toStrictEqual(action);
      expect(lowercase(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(lowercase('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies LowercaseAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(lowercase(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies LowercaseAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = lowercase();

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

    test('for empty strings', () => {
      expectNoActionIssue(action, ['']);
    });

    test('for lowercase strings', () => {
      expectNoActionIssue(action, ['hello', 'abc', 'lowercase', 'ñ']);
    });

    test('for strings with numbers', () => {
      expectNoActionIssue(action, ['hello123', 'abc123', 'test1']);
    });

    test('for strings with special characters', () => {
      expectNoActionIssue(action, [
        'hello-world',
        'hello_world',
        'hello.world',
        'hello world',
        'hello!',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = lowercase('message');
    const baseIssue: Omit<LowercaseIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'lowercase',
      expected: null,
      message: 'message',
      requirement: LOWERCASE_REGEX,
    };

    test('for uppercase strings', () => {
      expectActionIssue(action, baseIssue, ['HELLO', 'ABC', 'UPPERCASE']);
    });

    test('for strings starting with uppercase', () => {
      expectActionIssue(action, baseIssue, ['Hello', 'Hello world', 'A']);
    });

    test('for strings with uppercase characters', () => {
      expectActionIssue(action, baseIssue, [
        'hello World',
        'helloWorld',
        'Hello World!',
        'abc123Def',
      ]);
    });
  });
});
