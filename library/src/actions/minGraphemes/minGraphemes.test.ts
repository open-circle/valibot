import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getGraphemeCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  minGraphemes,
  type MinGraphemesAction,
  type MinGraphemesIssue,
} from './minGraphemes.ts';

describe('minGraphemes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MinGraphemesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'min_graphemes',
      reference: minGraphemes,
      expects: '>=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MinGraphemesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(minGraphemes(5)).toStrictEqual(action);
      expect(minGraphemes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(minGraphemes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MinGraphemesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(minGraphemes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MinGraphemesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = minGraphemes(5);

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
        '12345',
        '1234 ',
        '123456',
        '123456789',
        'foo bar baz',
      ]);
    });

    test('for valid emoji', () => {
      expectNoActionIssue(action, [
        '😀👋🏼🧩👩🏻‍🏫🫥',
        '😀👋🏼🧩👩🏻‍🏫🫥🫠',
        '😀👋🏼🧩👩🏻‍🏫🫥🫠🧑‍💻👻🥎',
      ]);
    });

    test('for lowest requirements', () => {
      expectNoActionIssue(minGraphemes(0), ['', ' ', 'foo', '😀', '👨‍👩‍👧‍👦']);
      expectNoActionIssue(minGraphemes(1), [' ', 'foo', '😀', '👨‍👩‍👧‍👦']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = minGraphemes(5, 'message');
    const baseIssue: Omit<
      MinGraphemesIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'min_graphemes',
      expected: '>=5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['', ' ', '1', 'foo', '1234', '12 4'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['😀', '😀👋🏼', '😀👋🏼🧩👩🏻‍🏫'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });

    test('for empty string with lowest requirement', () => {
      expectActionIssue(
        minGraphemes(1, 'message'),
        {
          kind: 'validation',
          type: 'min_graphemes',
          expected: '>=1',
          message: 'message',
          requirement: 1,
        } satisfies Omit<MinGraphemesIssue<string, 1>, 'input' | 'received'>,
        [''],
        (value) => `${_getGraphemeCount(value)}`
      );
    });
  });
});
