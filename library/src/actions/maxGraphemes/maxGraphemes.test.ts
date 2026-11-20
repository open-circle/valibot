import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { _getGraphemeCount } from '../../utils/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  maxGraphemes,
  type MaxGraphemesAction,
  type MaxGraphemesIssue,
} from './maxGraphemes.ts';

describe('maxGraphemes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MaxGraphemesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'max_graphemes',
      reference: maxGraphemes,
      expects: '<=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxGraphemesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(maxGraphemes(5)).toStrictEqual(action);
      expect(maxGraphemes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxGraphemes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MaxGraphemesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxGraphemes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MaxGraphemesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = maxGraphemes(5);

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

    test('without counting if code unit length is within requirement', () => {
      const segmentSpy = vi.spyOn(Intl.Segmenter.prototype, 'segment');
      try {
        action['~run']({ typed: true, value: '12345' }, {});
        expect(segmentSpy).not.toHaveBeenCalled();
      } finally {
        segmentSpy.mockRestore();
      }
    });

    test('for valid emoji', () => {
      expectNoActionIssue(action, ['😀', '😀👋🏼', '😀👋🏼🧩👩🏻‍🏫', '😀👋🏼🧩👩🏻‍🏫🫥']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = maxGraphemes(5, 'message');
    const baseIssue: Omit<
      MaxGraphemesIssue<string, 5>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'max_graphemes',
      expected: '<=5',
      message: 'message',
      requirement: 5,
    };

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['123456', '12345 ', '123456789', 'foo bar baz'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });

    test('for invalid emoji', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['😀👋🏼🧩👩🏻‍🏫🫥🫠', '😀👋🏼🧩👩🏻‍🏫🫥🫠🧑‍💻👻🥎'],
        (value) => `${_getGraphemeCount(value)}`
      );
    });
  });
});
