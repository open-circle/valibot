import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  maxBytes,
  type MaxBytesAction,
  type MaxBytesIssue,
} from './maxBytes.ts';

describe('maxBytes', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MaxBytesAction<string, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'max_bytes',
      reference: maxBytes,
      expects: '<=5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxBytesAction<string, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(maxBytes(5)).toStrictEqual(action);
      expect(maxBytes(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxBytes(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MaxBytesAction<string, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxBytes(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MaxBytesAction<string, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = maxBytes(5);

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
      expectNoActionIssue(action, ['', '1', '1234', '12345']);
    });

    test('for valid chars', () => {
      expectNoActionIssue(action, [
        'あ', // 'あ' is 3 bytes
        '🤖!', // '🤖' is 4 bytes
      ]);
    });

    test('without encoding if the upper byte bound meets the requirement', () => {
      const encodeSpy = vi.spyOn(TextEncoder.prototype, 'encode');
      try {
        maxBytes(6)['~run']({ typed: true, value: 'ab' }, {});
        expect(encodeSpy).not.toHaveBeenCalled();
      } finally {
        encodeSpy.mockRestore();
      }
    });
  });

  describe('should return dataset with issues', () => {
    const action = maxBytes(5, 'message');
    const baseIssue: Omit<MaxBytesIssue<string, 5>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'max_bytes',
      expected: '<=5',
      message: 'message',
      requirement: 5,
    };

    const getReceived = (value: string) =>
      `${new TextEncoder().encode(value).length}`;

    test('for invalid strings', () => {
      expectActionIssue(
        action,
        baseIssue,
        ['123456', 'foobarbaz123'],
        getReceived
      );
    });

    test('for invalid chars', () => {
      expectActionIssue(
        action,
        baseIssue,
        [
          'あい', // 'あい' is 6 bytes
        ],
        getReceived
      );
    });
  });
});
