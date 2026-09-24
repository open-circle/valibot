import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getCodePointCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  codePoints,
  type CodePointsAction,
  type CodePointsIssue,
} from './codePoints.ts';

describe('codePoints', () => {
  describe('should return action object', () => {
    const baseAction: Omit<CodePointsAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'code_points',
      reference: codePoints,
      expects: '5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: CodePointsAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(codePoints(5)).toStrictEqual(action);
      expect(codePoints(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(codePoints(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies CodePointsAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(codePoints(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CodePointsAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = codePoints(5);

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
      expectNoActionIssue(action, ['12345', '12 45', '1234 ', 'hello']);
    });

    test('for valid emoji', () => {
      expectNoActionIssue(action, ['👨🏽‍👩🏽', '😶‍🌫️😀', '😡👍😁😂😀', '0️⃣㊙️']);
    });

    test('for valid non-latin', () => {
      expectNoActionIssue(action, ['あ𛀙よろし', '𠮷野家で𩸽', '葛󠄀城市！']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = codePoints(5, 'message');
    const baseIssue: Omit<CodePointsIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'code_points',
      expected: '5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['', ' ', '1', '1234', '123 ', '123456', '12 456', '123456789'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['😀👋🏼🧩👩🏻‍🏫🫥', '㊙️㊙️0️⃣1️⃣2️⃣'],
        (value) => `${_getCodePointCount(value)}`
      );
    });

    test('for invalid non-latin', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['竈門禰󠄀豆子', '葛󠄀城市'],
        (value) => `${_getCodePointCount(value)}`
      );
    });
  });
});
