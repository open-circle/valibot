import { describe, expect, test } from 'vitest';
import type { NumberIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { multipleOf, type MultipleOfAction } from './multipleOf.ts';

describe('multipleOf', () => {
  describe('should return action object', () => {
    const baseAction: Omit<MultipleOfAction<number, 5, never>, 'message'> = {
      kind: 'validation',
      type: 'multiple_of',
      reference: multipleOf,
      expects: '%5',
      requirement: 5,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MultipleOfAction<number, 5, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(multipleOf(5)).toStrictEqual(action);
      expect(multipleOf(5, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(multipleOf(5, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies MultipleOfAction<number, 5, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(multipleOf(5, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies MultipleOfAction<number, 5, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for untyped inputs', () => {
      const issues: [NumberIssue] = [
        {
          kind: 'schema',
          type: 'number',
          input: null,
          expected: 'number',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        multipleOf(5)['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid numbers', () => {
      expectNoActionIssue(multipleOf(5), [-15, -10, -5, 0, 5, 10, 15]);
    });

    test('for valid bigints', () => {
      expectNoActionIssue(multipleOf(5n), [-15n, -10n, -5n, 0n, 5n, 10n, 15n]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseIssue = {
      kind: 'validation',
      type: 'multiple_of',
      expected: '%5',
      message: 'message',
    } as const;

    test('for invalid numbers', () => {
      expectActionIssue(
        multipleOf(5, 'message'),
        { ...baseIssue, requirement: 5 },
        [-14, -9, -4, 1, 3, 6, 11]
      );
    });

    test('for infinity', () => {
      expectActionIssue(
        multipleOf(5, 'message'),
        { ...baseIssue, requirement: 5 },
        [-Infinity, Infinity]
      );
    });

    test('for NaN', () => {
      expectActionIssue(
        multipleOf(5, 'message'),
        { ...baseIssue, requirement: 5 },
        [NaN]
      );
    });

    test('for invalid bigints', () => {
      expectActionIssue(
        multipleOf(5n, 'message'),
        { ...baseIssue, requirement: 5n },
        [-14n, -9n, -4n, 1n, 3n, 6n, 11n]
      );
    });
  });
});
