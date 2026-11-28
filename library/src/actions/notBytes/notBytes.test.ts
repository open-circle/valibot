import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  notBytes,
  type NotBytesAction,
  type NotBytesIssue,
} from './notBytes.ts';

describe('notBytes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NotBytesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'not_bytes',
      reference: notBytes,
      expects: '!5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotBytesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notBytes(5)).toStrictEqual(action);
      expect(notBytes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notBytes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotBytesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notBytes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotBytesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = notBytes(5);

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
      expectNoActionIssue(action, ['', '1234', '123456', '123456789']);
    });

    test('for valid chars', () => {
      expectNoActionIssue(action, [
        'あ', // 'あ' is 3 bytes
        '🤖', // '🤖' is 4 bytes
        'あい', // 'あい' is 6 bytes
      ]);
    });

    test('without encoding if the requirement exceeds the upper byte bound', () => {
      const encodeSpy = vi.spyOn(TextEncoder.prototype, 'encode');
      try {
        notBytes(7)['~run']({ typed: true, value: 'ab' }, {});
        expect(encodeSpy).not.toHaveBeenCalled();
      } finally {
        encodeSpy.mockRestore();
      }
    });

    test('without encoding if the requirement is below the lower byte bound', () => {
      const encodeSpy = vi.spyOn(TextEncoder.prototype, 'encode');
      try {
        notBytes(1)['~run']({ typed: true, value: 'ab' }, {});
        expect(encodeSpy).not.toHaveBeenCalled();
      } finally {
        encodeSpy.mockRestore();
      }
    });
  });

  describe('should return dataset with issues', () => {
    const action = notBytes(5, 'message');
    const baseIssue: Omit<NotBytesIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'not_bytes',
      expected: '!5',
      message: 'message',
      requirement: 5,
    };

    const getReceived = (value: string) =>
      `${new TextEncoder().encode(value).length}`;

    test('for invalid strings', () => {
      expectActionIssue(action, baseIssue, ['12345', 'abcde'], getReceived);
    });

    test('for invalid chars', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          '12あ', // 'あ' is 3 bytes
          '🤖!', // '🤖' is 4 bytes
        ],
        getReceived
      );
    });
  });
});
