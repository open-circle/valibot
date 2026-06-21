import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getCodePointCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  minCodePoints,
  type MinCodePointsAction,
  type MinCodePointsIssue,
} from './minCodePoints.ts';

describe('minCodePoints', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MinCodePointsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'min_code_points',
      reference: minCodePoints,
      expects: '>=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MinCodePointsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(minCodePoints(5)).toStrictEqual(action);
      expect(minCodePoints(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(minCodePoints(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MinCodePointsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(minCodePoints(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MinCodePointsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = minCodePoints(5);

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
        '1️⃣㊙️',
        '1️⃣2️⃣',
        '😶‍🌫️👍',
        '😶‍🌫️👍👍',
        '😀👋🏼🧩👩🏻‍🏫',
        '😀👋🏼🧩👩🏻‍🏫🫥',
        '😀👋🏼🧩👩🏻‍🏫🫥🫠',
        '😀👋🏼🧩👩🏻‍🏫🫥🫠🧑‍💻👻🥎',
      ]);
    });

    test('for valid non-latin', () => {
      expectNoActionIssue(action, [
        '𠮷野家で𩸽',
        '奈良葛󠄀城', // valid thanks to U+E0100
        '奈良葛城市',
        '奈良葛󠄀城市',
        '奈良県葛城市',
        '奈良県葛󠄀城市',
        '竈門禰豆子',
        '竈門禰󠄀豆子',
        'あ𛀙よろし',
        '𛁟゙ん𛀸゙', // だんご
        '𛁟゙ん𛀸゙🍡',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = minCodePoints(5, 'message');
    const baseIssue: Omit<
      MinCodePointsIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'min_code_points',
      expected: '>=5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['', ' ', '1', 'foo', '1234', '12 4'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['1️⃣', '😀', '😀👋🏼🧩'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid non-latin', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          '𠮷野家', // signboard notation
          '葛飾区',
          '𠮷田太郎',
          '葛󠄀城市',
          '天𛂱゚𛃭', // 天ぷら (tempura)
        ],
        (value) => `${_getCodePointCount(value)}`
      );
    });
  });
});
