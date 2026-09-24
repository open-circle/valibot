import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getGraphemeCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  graphemes,
  type GraphemesAction,
  type GraphemesIssue,
} from './graphemes.ts';

describe('graphemes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<GraphemesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'graphemes',
      reference: graphemes,
      expects: '5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: GraphemesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(graphemes(5)).toStrictEqual(action);
      expect(graphemes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(graphemes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies GraphemesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(graphemes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies GraphemesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = graphemes(5);

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
      expectNoActionIssue(action, ['😀👋🏼🧩👩🏻‍🏫🫥']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = graphemes(5, 'message');
    const baseIssue: Omit<GraphemesIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'graphemes',
      expected: '5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['', ' ', '1', '1234', '123 ', '123456', '12 456', '123456789'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['😀', '😀👋🏼🧩👩🏻‍🏫', '😀👋🏼🧩👩🏻‍🏫🫥🫠', '😀👋🏼🧩👩🏻‍🏫🫥🫠🧑‍💻👻🥎'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });
  });
});
