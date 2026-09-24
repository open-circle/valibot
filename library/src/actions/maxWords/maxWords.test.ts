import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getWordCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  maxWords,
  type MaxWordsAction,
  type MaxWordsIssue,
} from './maxWords.ts';

describe('maxWords', () => {
  describe('should return action object', () => {
    const baseAction: Omit<
      MaxWordsAction<string, 'en', 3, never>,
      'message'
    > = {
      kind: 'validation',
      type: 'max_words',
      reference: maxWords,
      expects: '<=3',
      locales: 'en',
      requirement: 3,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxWordsAction<string, 'en', 3, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(maxWords('en', 3)).toStrictEqual(action);
      expect(maxWords('en', 3, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxWords('en', 3, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MaxWordsAction<string, 'en', 3, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxWords('en', 3, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MaxWordsAction<string, 'en', 3, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = maxWords('en', 3);

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
        'for bar baz',
        'Lorem ipsum?',
        'Lorem ipsum dolor?',
        'Hi, welcome!',
        'Hi, welcome home!',
      ]);
    });

    test('without counting if code unit length is within requirement', () => {
      const segmentSpy = vi.spyOn(Intl.Segmenter.prototype, 'segment');
      try {
        action['~run']({ typed: true, value: 'foo' }, {});
        expect(segmentSpy).not.toHaveBeenCalled();
      } finally {
        segmentSpy.mockRestore();
      }
    });
  });

  describe('should return dataset with issues', () => {
    const action = maxWords('en', 3, 'message');
    const baseIssue: Omit<MaxWordsIssue<string, 3>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'max_words',
      expected: '<=3',
      message: 'message',
      requirement: 3,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          'for bar baz qux',
          'Lorem ipsum dolor sit?',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
          'Hi, welcome home! How are you?',
        ],
        (value) => `${_getWordCount('en', value)}`
      );
    });
  });
});
