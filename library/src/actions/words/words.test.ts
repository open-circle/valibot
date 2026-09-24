import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getWordCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { words, type WordsAction, type WordsIssue } from './words.ts';

describe('words', () => {
  describe('should return action object', () => {
    const baseAction: Omit<WordsAction<string, 'en', 3, never>, 'message'> = {
      kind: 'validation',
      type: 'words',
      reference: words,
      expects: '3',
      locales: 'en',
      requirement: 3,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: WordsAction<string, 'en', 3, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(words('en', 3)).toStrictEqual(action);
      expect(words('en', 3, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(words('en', 3, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies WordsAction<string, 'en', 3, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(words('en', 3, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies WordsAction<string, 'en', 3, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = words('en', 3);

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
        'foo bar baz',
        'Lorem ipsum dolor?',
        'Hi, welcome home!',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = words('en', 3, 'message');
    const baseIssue: Omit<WordsIssue<string, 3>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'words',
      expected: '3',
      message: 'message',
      requirement: 3,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          '',
          ' ',
          'foo',
          'foo bar',
          'for bar baz qux',
          'Lorem ipsum?',
          'Lorem ipsum dolor sit?',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
          'Hi, welcome!',
          'Hi, welcome home! How are you?',
        ],
        (value) => `${_getWordCount('en', value)}`
      );
    });
  });
});
