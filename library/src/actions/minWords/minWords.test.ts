import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getWordCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  minWords,
  type MinWordsAction,
  type MinWordsIssue,
} from './minWords.ts';

describe('minWords', () => {
  describe('should return action object', () => {
    const baseAction: Omit<
      MinWordsAction<string, 'en', 3, never>,
      'message'
    > = {
      kind: 'validation',
      type: 'min_words',
      reference: minWords,
      expects: '>=3',
      locales: 'en',
      requirement: 3,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MinWordsAction<string, 'en', 3, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(minWords('en', 3)).toStrictEqual(action);
      expect(minWords('en', 3, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(minWords('en', 3, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MinWordsAction<string, 'en', 3, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(minWords('en', 3, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MinWordsAction<string, 'en', 3, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = minWords('en', 3);

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
        'for bar baz',
        'for bar baz qux',
        'Lorem ipsum dolor?',
        'Lorem ipsum dolor sit?',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        'Hi, welcome home!',
        'Hi, welcome home! How are you?',
      ]);
    });

    test('for any string if requirement is zero', () => {
      expectNoActionIssue(minWords('en', 0), ['', ' ', 'foo', 'foo bar']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = minWords('en', 3, 'message');
    const baseIssue: Omit<MinWordsIssue<string, 3>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'min_words',
      expected: '>=3',
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
          'Lorem?',
          'Lorem ipsum?',
          'Hi, ...',
          'Hi, welcome!',
        ],
        (value) => `${_getWordCount('en', value)}`
      );
    });
  });
});
