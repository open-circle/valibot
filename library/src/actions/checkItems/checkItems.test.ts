import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import type { PartialDataset } from '../../types/dataset.ts';
import { expectNoActionIssue } from '../../vitest/index.ts';
import { checkItems, type CheckItemsAction } from './checkItems.ts';
import type { CheckItemsIssue } from './types.ts';

describe('checkItems', () => {
  describe('should return action object', () => {
    const requirement = (item: string) => item.startsWith('DE');
    const baseAction: Omit<CheckItemsAction<string[], never>, 'message'> = {
      kind: 'validation',
      type: 'check_items',
      reference: checkItems,
      expects: null,
      requirement,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: CheckItemsAction<string[], undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(checkItems<string[]>(requirement)).toStrictEqual(action);
      expect(
        checkItems<string[], undefined>(requirement, undefined)
      ).toStrictEqual(action);
    });

    test('with string message', () => {
      const message = 'message';
      expect(
        checkItems<string[], 'message'>(requirement, message)
      ).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CheckItemsAction<string[], 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(
        checkItems<string[], typeof message>(requirement, message)
      ).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CheckItemsAction<string[], typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = checkItems<number[]>((item: number) => item > 9);

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

    test('for empty array', () => {
      expectNoActionIssue(action, [[]]);
    });

    test('for valid content', () => {
      expectNoActionIssue(action, [[10, 11, 12, 13, 99]]);
    });
  });

  describe('should return dataset with issues', () => {
    const requirement = (item: number) => item > 9;
    const action = checkItems<number[], 'message'>(requirement, 'message');

    const baseIssue: Omit<CheckItemsIssue<number[]>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'check_items',
      expected: null,
      message: 'message',
      requirement,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for invalid content', () => {
      const input = [-12, 345, 6, 10];
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: true,
        value: input,
        issues: [
          {
            ...baseIssue,
            input: input[0],
            received: `${input[0]}`,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 0,
                value: input[0],
              },
            ],
          },
          {
            ...baseIssue,
            input: input[2],
            received: `${input[2]}`,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 2,
                value: input[2],
              },
            ],
          },
        ],
      } satisfies PartialDataset<number[], CheckItemsIssue<number[]>>);
    });

    test('with abort early', () => {
      const input = [-12, 345, 6, 10];
      expect(
        action['~run']({ typed: true, value: input }, { abortEarly: true })
      ).toStrictEqual({
        typed: true,
        value: input,
        issues: [
          {
            ...baseIssue,
            abortEarly: true,
            input: input[0],
            received: `${input[0]}`,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 0,
                value: input[0],
              },
            ],
          },
        ],
      } satisfies PartialDataset<number[], CheckItemsIssue<number[]>>);
    });
  });
});
