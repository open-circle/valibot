import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { trimmed, type TrimmedAction, type TrimmedIssue } from './trimmed.ts';

describe('trimmed', () => {
  describe('should return action object', () => {
    const baseAction: Omit<TrimmedAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'trimmed',
      reference: trimmed,
      expects: null,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: TrimmedAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(trimmed()).toStrictEqual(action);
      expect(trimmed(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(trimmed('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies TrimmedAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(trimmed(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies TrimmedAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = trimmed();

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

    test('for strings without whitespace', () => {
      expectNoActionIssue(action, ['f', 'foo', '123', '#$%']);
    });

    test('for strings with inner whitespace', () => {
      expectNoActionIssue(action, [
        'foo bar',
        'foo  bar',
        'foo\tbar',
        'foo\nbar',
        'foo\u00A0bar',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = trimmed('message');
    const baseIssue: Omit<TrimmedIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'trimmed',
      expected: null,
      message: 'message',
    };

    test('for blank strings', () => {
      expectActionIssue(action, baseIssue, [' ', '  ', '\t', '\n', ' \t\n']);
    });

    test('for leading whitespace', () => {
      expectActionIssue(action, baseIssue, [
        ' foo',
        '  foo',
        '\tfoo',
        '\nfoo',
        '\r\nfoo',
      ]);
    });

    test('for trailing whitespace', () => {
      expectActionIssue(action, baseIssue, [
        'foo ',
        'foo  ',
        'foo\t',
        'foo\n',
        'foo\r\n',
      ]);
    });

    test('for leading and trailing whitespace', () => {
      expectActionIssue(action, baseIssue, [' foo ', '\tfoo\n', ' foo bar ']);
    });

    test('for non-ASCII whitespace', () => {
      expectActionIssue(action, baseIssue, [
        '\u00A0foo',
        'foo\u2003',
        '\u3000foo',
        'foo\uFEFF',
      ]);
    });
  });
});
