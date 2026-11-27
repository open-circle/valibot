import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getGraphemeCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  notGraphemes,
  type NotGraphemesAction,
  type NotGraphemesIssue,
} from './notGraphemes.ts';

describe('notGraphemes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NotGraphemesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'not_graphemes',
      reference: notGraphemes,
      expects: '!5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotGraphemesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notGraphemes(5)).toStrictEqual(action);
      expect(notGraphemes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notGraphemes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotGraphemesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notGraphemes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotGraphemesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = notGraphemes(5);

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
        '1',
        '1234',
        '123 ',
        '123456',
        '12 456',
        '123456789',
      ]);
    });

    test('for valid emoji', () => {
      expectNoActionIssue(action, [
        '😀',
        '😀👋🏼🧩👩🏻‍🏫',
        '😀👋🏼🧩👩🏻‍🏫🫥🫠',
        '😀👋🏼🧩👩🏻‍🏫🫥🫠🧑‍💻👻🥎',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = notGraphemes(5, 'message');
    const baseIssue: Omit<
      NotGraphemesIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'not_graphemes',
      expected: '!5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['12345', '12 45', '1234 ', 'hello'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['😀👋🏼🧩👩🏻‍🏫🫥'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });
  });

  describe('should skip scan when string length settles verdict', () => {
    test('when grapheme bounds exclude requirement', () => {
      const segmentSpy = vi.spyOn(Intl.Segmenter.prototype, 'segment');
      try {
        expectNoActionIssue(notGraphemes(5), ['', '1234', '😀']);
        expectNoActionIssue(notGraphemes(0), ['a']);
        expectNoActionIssue(notGraphemes(-1), ['']);
        expect(segmentSpy).not.toHaveBeenCalled();
      } finally {
        segmentSpy.mockRestore();
      }
    });

    test('when grapheme bounds include requirement', () => {
      const segmentSpy = vi.spyOn(Intl.Segmenter.prototype, 'segment');
      try {
        expectNoActionIssue(notGraphemes(5), ['😀👋🏼🧩👩🏻‍🏫']);
        expectActionIssue(
          notGraphemes(0, 'message'),
          {
            kind: 'validation',
            type: 'not_graphemes',
            expected: '!0',
            message: 'message',
            requirement: 0,
          },
          [''],
          () => '0'
        );
        expect(segmentSpy).toHaveBeenCalled();
      } finally {
        segmentSpy.mockRestore();
      }
    });
  });
});
