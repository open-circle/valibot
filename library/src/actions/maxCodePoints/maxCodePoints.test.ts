import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getCodePointCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  maxCodePoints,
  type MaxCodePointsAction,
  type MaxCodePointsIssue,
} from './maxCodePoints.ts';

describe('maxCodePoints', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MaxCodePointsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'max_code_points',
      reference: maxCodePoints,
      expects: '<=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxCodePointsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(maxCodePoints(5)).toStrictEqual(action);
      expect(maxCodePoints(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxCodePoints(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MaxCodePointsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxCodePoints(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MaxCodePointsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = maxCodePoints(5);

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
      expectNoActionIssue(action, ['', ' ', '1', 'foo', '12345', '12 45']);
    });

    test('for valid emoji', () => {
      expectNoActionIssue(action, ['😀', '😀👋🏼🧩', '😶‍🌫️👍', '1️⃣', '1️⃣㊙️']);
    });

    test('for valid non-latin', () => {
      expectNoActionIssue(action, [
        '𠮷野家', // signboard notation
        '𠮷田太郎',
        '𠮷野家で𩸽',
        '奈良葛󠄀城',
        '奈良葛城市',
        '竈門禰豆子',
        'あ𛀙よろし',
        // We rarely see the following notations in the wild today (some antique restaurants or shops)
        '天𛂱゚𛃭', // 天ぷら (tempura)
        '𛁟゙ん𛀸゙', // だんご (🍡)
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = maxCodePoints(5, 'message');
    const baseIssue: Omit<
      MaxCodePointsIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'max_code_points',
      expected: '<=5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['123456', '12345 ', '123456789', 'foo bar baz'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          '1️⃣2️⃣',
          '😶‍🌫️👍👍',
          '😀👋🏼🧩👩🏻‍🏫',
          '😀👋🏼🧩👩🏻‍🏫🫥',
          '😀👋🏼🧩👩🏻‍🏫🫥🫠',
          '😀👋🏼🧩👩🏻‍🏫🫥🫠🧑‍💻👻🥎',
        ],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid non-latin', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          // The culprit is E+0100
          '奈良葛󠄀城市',
          '奈良県葛城市',
          '奈良県葛󠄀城市',
          '竈門禰󠄀豆子',
          // 🍡: 1 code point emoji & U+3099 consumes one more code points
          '𛁟゙ん𛀸゙🍡',
        ],
        (value) => `${_getCodePointCount(value)}`
      );
    });
  });
});
