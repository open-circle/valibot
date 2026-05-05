import { describe, expect, test } from 'vitest';
import type { RecordIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  notEntries,
  type NotEntriesAction,
  type NotEntriesIssue,
} from './notEntries.ts';

describe('notEntries', () => {
  type Input = Record<string, number>;

  describe('should return action object', () => {
    const baseAction: Omit<NotEntriesAction<Input, 3, never>, 'message'> = {
      kind: 'validation',
      type: 'not_entries',
      reference: notEntries,
      expects: '!3',
      requirement: 3,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NotEntriesAction<Input, 3, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(notEntries(3)).toStrictEqual(action);
      expect(notEntries(3, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(notEntries(3, 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NotEntriesAction<Input, 3, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(notEntries(3, message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NotEntriesAction<Input, 3, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = notEntries(3);

    test('for untyped inputs', () => {
      const issues: [RecordIssue] = [
        {
          kind: 'schema',
          type: 'record',
          input: null,
          expected: 'Object',
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

    test('for valid objects', () => {
      expectNoActionIssue(action, [
        {},
        { foo: 1 },
        { foo: 1, bar: 2 },
        { foo: 1, bar: 2, baz: 3, qux: 4 },
        { foo: 1, bar: 2, baz: 3, qux: 4, quux: 5 },
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = notEntries(3, 'message');
    const baseIssue: Omit<NotEntriesIssue<Input, 3>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'not_entries',
      expected: '!3',
      message: 'message',
      requirement: 3,
    };

    test('for invalid objects', () => {
      expectActionIssue(
        action,
        baseIssue,
        [{ foo: 1, bar: 2, baz: 3 }],
        (value) => `${Object.keys(value).length}`
      );
    });
  });
});
