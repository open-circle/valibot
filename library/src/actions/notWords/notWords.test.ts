import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getWordCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  notWords,
  type NotWordsAction,
  type NotWordsIssue,
} from './notWords.ts';

describe('notWords', () => {
  describe('should return action object', () => {
    const baseAction: Omit<
      NotWordsAction<string, 'en', 3, never>,
      'message'
    > = {
      kind: 'validation',
      type: 'not_words',
      reference: notWords,
      expects: '!3',
      locales: 'en',
      requirement: 3,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotWordsAction<string, 'en', 3, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notWords('en', 3)).toStrictEqual(action);
      expect(notWords('en', 3, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notWords('en', 3, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotWordsAction<string, 'en', 3, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notWords('en', 3, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotWordsAction<string, 'en', 3, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = notWords('en', 3);

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
        ' ',
        'foo',
        'foo bar',
        'for bar baz qux',
        'Lorem ipsum?',
        'Lorem ipsum dolor sit?',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
        'Hi, welcome!',
        'Hi, welcome home! How are you?',
      ]);
    });

    test('without counting if the requirement exceeds the upper bound', () => {
      const segmentSpy = vi.spyOn(Intl.Segmenter.prototype, 'segment');
      try {
        notWords('en', 5)['~run']({ typed: true, value: 'foo' }, {});
        expect(segmentSpy).not.toHaveBeenCalled();
      } finally {
        segmentSpy.mockRestore();
      }
    });
  });

  describe('should return dataset with issues', () => {
    const action = notWords('en', 3, 'message');
    const baseIssue: Omit<NotWordsIssue<string, 3>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'not_words',
      expected: '!3',
      message: 'message',
      requirement: 3,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['foo bar baz', 'Lorem ipsum dolor?', 'Hi, welcome home!'],
        (value) => `${_getWordCount('en', value)}`
      );
    });
  });
});
