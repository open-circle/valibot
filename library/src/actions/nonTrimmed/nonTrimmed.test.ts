import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  nonTrimmed,
  type NonTrimmedAction,
  type NonTrimmedIssue,
} from './nonTrimmed.ts';

describe('nonTrimmed', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NonTrimmedAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'non_trimmed',
      reference: nonTrimmed,
      expects: null,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NonTrimmedAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(nonTrimmed()).toStrictEqual(action);
      expect(nonTrimmed(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(nonTrimmed('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NonTrimmedAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(nonTrimmed(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NonTrimmedAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = nonTrimmed();

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

    test('for blank strings', () => {
      expectNoActionIssue(action, [' ', '  ', '\t', '\n', ' \t\n']);
    });

    test('for leading whitespace', () => {
      expectNoActionIssue(action, [
        ' foo',
        '  foo',
        '\tfoo',
        '\nfoo',
        '\r\nfoo',
      ]);
    });

    test('for trailing whitespace', () => {
      expectNoActionIssue(action, [
        'foo ',
        'foo  ',
        'foo\t',
        'foo\n',
        'foo\r\n',
      ]);
    });

    test('for leading and trailing whitespace', () => {
      expectNoActionIssue(action, [' foo ', '\tfoo\n', ' foo bar ']);
    });

    test('for non-ASCII whitespace', () => {
      expectNoActionIssue(action, [
        '\u00A0foo',
        'foo\u2003',
        '\u3000foo',
        'foo\uFEFF',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = nonTrimmed('message');
    const baseIssue: Omit<NonTrimmedIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'non_trimmed',
      expected: null,
      message: 'message',
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['']);
    });

    test('for strings without whitespace', () => {
      expectActionIssue(action, baseIssue, ['f', 'foo', '123', '#$%']);
    });

    test('for strings with inner whitespace', () => {
      expectActionIssue(action, baseIssue, [
        'foo bar',
        'foo  bar',
        'foo\tbar',
        'foo\nbar',
        'foo\u00A0bar',
      ]);
    });
  });
});
