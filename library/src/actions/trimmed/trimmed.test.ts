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

    test('for valid strings', () => {
      expectNoActionIssue(action, [
        '',
        'foo',
        'foo bar',
        'foo  bar',
        'foobarbaz123',
        'a b c',
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

    test('for strings with leading whitespace', () => {
      expectActionIssue(action, baseIssue, [
        ' ',
        '  ',
        ' foo',
        '\tfoo',
        '\nfoo',
        '\rfoo',
        '\ffoo',
        '\vfoo',
        '\u00A0foo',
        '\u2003foo',
      ]);
    });

    test('for strings with trailing whitespace', () => {
      expectActionIssue(action, baseIssue, [
        'foo ',
        'foo  ',
        'foo\t',
        'foo\n',
        'foo\r',
        'foo\f',
        'foo\v',
        'foo\u00A0',
        'foo\u2003',
      ]);
    });

    test('for strings with leading and trailing whitespace', () => {
      expectActionIssue(action, baseIssue, [
        ' foo ',
        '  foo  ',
        '\tfoo\t',
        '\nfoo\n',
        ' foo bar ',
      ]);
    });
  });
});
