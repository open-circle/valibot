import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  minBytes,
  type MinBytesAction,
  type MinBytesIssue,
} from './minBytes.ts';

describe('minBytes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MinBytesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'min_bytes',
      reference: minBytes,
      expects: '>=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MinBytesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(minBytes(5)).toStrictEqual(action);
      expect(minBytes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(minBytes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MinBytesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(minBytes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MinBytesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = minBytes(5);

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
      expectNoActionIssue(action, ['12345', '123456', 'foobarbaz123']);
    });

    test('without encoding when the UTF-16 length meets the requirement', () => {
      const encodeSpy = vi.spyOn(TextEncoder.prototype, 'encode');
      try {
        expectNoActionIssue(action, ['12345']);
        expect(encodeSpy).not.toHaveBeenCalled();
      } finally {
        encodeSpy.mockRestore();
      }
    });

    test('for valid chars', () => {
      expectNoActionIssue(action, [
        '🤖!', // '🤖' is 4 bytes
        'あい', // 'あい' is 6 bytes
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = minBytes(5, 'message');
    const baseIssue: Omit<MinBytesIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'min_bytes',
      expected: '>=5',
      message: 'message',
      requirement: 5,
    };

    const getReceived = (value: string) =>
      `${new TextEncoder().encode(value).length}`;

    test('for invalid strings', () => {
      expectActionIssue(action, baseIssue, ['', '1', '1234'], getReceived);
    });

    test('for invalid chars', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          'あ', // 'あ' is 3 bytes
          '🤖', // '🤖' is 4 bytes
        ],
        getReceived
      );
    });
  });
});
