import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { isbn, type IsbnAction, type IsbnIssue } from './isbn.ts';

describe('ISBN', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsbnAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'isbn',
      reference: isbn,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsbnAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isbn()).toStrictEqual(action);
      expect(isbn(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isbn('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsbnAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isbn(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsbnAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isbn();

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

    test('for ISBN-10', () => {
      expectNoActionIssue(action, [
        '4873118735',
        '4-87311-873-5',
        '4 87311 873 5',
        '020530902X',
        '0-205-30902-X',
        '0471958697', // check digit 0
        '0-306 40615-2', // mixed separators
      ]);
    });

    test('for ISBN-13', () => {
      expectNoActionIssue(action, [
        '978-4873118734',
        '9784873118734',
        '978-4-87311-873-4',
        '978 4 87311 873 4',
        '9790000000001', // 979 prefix
        '9791843123391', // 979 prefix
        '9783161484100', // check digit 0
        '978-0 306 40615-7', // mixed separators
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isbn('message');
    const baseIssue: Omit<IsbnIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'isbn',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for ISBN-10', () => {
      expectActionIssue(action, baseIssue, [
        '4873118736', // invalid check digit
        '4 87311 873 6', // invalid check digit
        '020530902x', // lowercase 'x'
        '020530902 x', // lowercase 'x'
        '020530902', // too short
        '020530902XX', // too long
        'X234567890', // X in wrong position
        '12345X7890', // X in middle
      ]);
    });

    test('for ISBN-13', () => {
      expectActionIssue(action, baseIssue, [
        '9784873118735', // invalid check digit
        '978 4873118735', // invalid check digit
        '978487311873', // too short
        '97848731187345', // too long
        '978030640615X', // X not allowed
        '9770000000001', // invalid prefix
        '9800000000002', // invalid prefix
      ]);
    });

    test('for other invalid formats', () => {
      expectActionIssue(action, baseIssue, [
        'abc1234567890', // letters
        '978abc0000000', // letters in ISBN-13
        '12345', // too short for both
        '97804739123456', // too long (14 digits)
      ]);
    });
  });
});
