import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getCodePointCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  notCodePoints,
  type NotCodePointsAction,
  type NotCodePointsIssue,
} from './notCodePoints.ts';

describe('notCodePoints', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NotCodePointsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'not_code_points',
      reference: notCodePoints,
      expects: '!5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotCodePointsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notCodePoints(5)).toStrictEqual(action);
      expect(notCodePoints(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notCodePoints(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotCodePointsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notCodePoints(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotCodePointsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = notCodePoints(5);

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
        '😀👍🧩',
        '😀👍🧩😁',
        '😀👍🧩😁🫥🫠',
        '😀👍🧩😁🫥🫠🤖👻🥎',
      ]);
    });

    test('for valid non-latin', () => {
      expectNoActionIssue(action, [
          '𠮷野家', // signboard notation
          '葛飾区',
          '𠮷田太郎',
          '葛󠄀城市',
          '天𛂱゚𛃭', // 天ぷら (tempura)
          '奈良葛󠄀城市',
          '奈良県葛城市',
          '奈良県葛󠄀城市',
          '竈門禰󠄀豆子', // valid thanks to U+E0100
          '𛁟゙ん𛀸゙🍡',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = notCodePoints(5, 'message');
    const baseIssue: Omit<
      NotCodePointsIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'not_code_points',
      expected: '!5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['12345', '12 45', '1234 ', 'hello'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['😀👍🧩😁🫥'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid non-latin', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          '𠮷野家で𩸽',
          '奈良葛󠄀城', // invalid due to U+E0100
          '奈良葛城市',
          '竈門禰豆子',
          'あ𛀙よろし',
          '𛁟゙ん𛀸゙', // だんご (including 2 combining voiced sound marks)
        ],
        (value) => `${_getCodePointCount(value)}`
      );
    });
  });
});
