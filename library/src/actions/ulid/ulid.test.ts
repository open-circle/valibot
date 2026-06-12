import { describe, expect, test } from 'vitest';
import { ULID_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ulid, type UlidAction, type UlidIssue } from './ulid.ts';

describe('ulid', () => {
  describe('should return action object', () => {
    const baseAction: Omit<UlidAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'ulid',
      reference: ulid,
      expects: null,
      requirement: ULID_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: UlidAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(ulid()).toStrictEqual(action);
      expect(ulid(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(ulid('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies UlidAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(ulid(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies UlidAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = ulid();

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

    test('for valid ULIDs', () => {
      expectNoActionIssue(action, [
        '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        '01bx5zzkbkactav9wevgemmvry',
        '0123456789abcdefghjkmnpqrs',
        '7ZZZZZZZZZZZZZZZZZZZZZZZZZ',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = ulid('message');
    const baseIssue: Omit<UlidIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'ulid',
      expected: null,
      message: 'message',
      requirement: ULID_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 01ARZ3NDEKTSV4RRFFQ69G5FAV',
        '01ARZ3NDEKTSV4RRFFQ69G5FAV ',
        ' 01ARZ3NDEKTSV4RRFFQ69G5FAV ',
      ]);
    });

    test('for too short ULIDs', () => {
      expectActionIssue(action, baseIssue, [
        '01ARZ3NDEKTSV4RRFFQ69G5FA',
        '01bx5zzkbkactav9',
      ]);
    });

    test('for too long ULIDs', () => {
      expectActionIssue(action, baseIssue, [
        '01ARZ3NDEKTSV4RRFFQ69G5FAV1',
        '01bx5zzkbkactav9wevgemmvry123456789',
      ]);
    });

    test('for invalid letters', () => {
      expectActionIssue(action, baseIssue, [
        '01ARZ3NDIKTSV4RRFFQ69G5FAV',
        '01bx5zikbkactav9wevgemmvry',
        'L1ARZ3NDEKTSV4RRFFQ69G5FAV',
        'l1bx5zzkbkactav9wevgemmvry',
        '01ARZ3NDEKTSV4RRFFQ69G5OAV',
        '01bx5zzkbkactav9wevgemmory',
        '01ARZ3NDEKTSV4RRFFQ69G5FAU',
        '01bx5zzkbkactav9wevgemmvru',
      ]);
    });

    test('for overflowed timestamp (first character above 7)', () => {
      // The ULID spec states that the most significant bit of the timestamp is
      // always 0, so the largest valid ULID is 7ZZZZZZZZZZZZZZZZZZZZZZZZZ.
      // Any ULID whose first character is 8 or above encodes a timestamp
      // that exceeds 2^48-1 and must be rejected.
      expectActionIssue(action, baseIssue, [
        '8ARZ3NDEKTSV4RRFFQ69G5FAV0',
        '9ARZ3NDEKTSV4RRFFQ69G5FAV0',
        'ABCDEFGHJKMNPQRSTVWXYZ0123',
      ]);
    });
  });
});
