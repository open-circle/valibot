import { describe, expect, test } from 'vitest';
import { pipeAsync, safeParseAsync } from '../../methods/index.ts';
import { array, number, type StringIssue } from '../../schemas/index.ts';
import type { PartialDataset } from '../../types/dataset.ts';
import { expectNoActionIssueAsync } from '../../vitest/index.ts';
import {
  type CheckItemsActionAsync,
  checkItemsAsync,
} from './checkItemsAsync.ts';
import type { CheckItemsIssue } from './types.ts';

describe('checkItemsAsync', () => {
  describe('should return action object', () => {
    const requirement = async (item: string) => item.startsWith('DE');
    const baseAction: Omit<
      CheckItemsActionAsync<string[], never>,
      'message'
    > = {
      kind: 'validation',
      type: 'check_items',
      reference: checkItemsAsync,
      expects: null,
      requirement,
      async: true,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: CheckItemsActionAsync<string[], undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(checkItemsAsync<string[]>(requirement)).toStrictEqual(action);
      expect(
        checkItemsAsync<string[], undefined>(requirement, undefined)
      ).toStrictEqual(action);
    });

    test('with string message', () => {
      const message = 'message';
      expect(
        checkItemsAsync<string[], 'message'>(requirement, message)
      ).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CheckItemsActionAsync<string[], 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(
        checkItemsAsync<string[], typeof message>(requirement, message)
      ).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CheckItemsActionAsync<string[], typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = checkItemsAsync<number[]>(async (item: number) => item > 9);

    test('for untyped inputs', async () => {
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
        await action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for empty array', async () => {
      await expectNoActionIssueAsync(action, [[]]);
    });

    test('for valid content', async () => {
      await expectNoActionIssueAsync(action, [[10, 11, 12, 13, 99]]);
    });
  });

  describe('should return dataset with issues', () => {
    const requirement = async (item: number) => item > 9;
    const action = checkItemsAsync<number[], 'message'>(requirement, 'message');

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

    test('for invalid content', async () => {
      const input = [-12, 345, 6, 10];
      expect(
        await action['~run']({ typed: true, value: input }, {})
      ).toStrictEqual({
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
  });

  describe('abort configuration', () => {
    test.each([
      [{ abortEarly: true }, [1], [1, -2, -3]],
      [{}, [1, 2], [1, -2, -3]],
      [{ abortEarly: false }, [1, 2], [1, -2, -3]],
      [{ abortPipeEarly: true }, [1, 2], [1, -2, -3]],
    ])('should respect config %j', async (config, keys, expectedVisited) => {
      const visited: number[] = [];
      const messages: number[] = [];
      const input = [1, -2, -3];
      const schema = pipeAsync(
        array(number()),
        checkItemsAsync<number[], (issue: CheckItemsIssue<number[]>) => string>(
          async (item, index, array) => {
            expect(array).toStrictEqual(input);
            expect(item).toBe(array[index]);
            visited.push(item);
            return item > 0;
          },
          (issue) => {
            messages.push(issue.input);
            return `Invalid item: ${issue.input}`;
          }
        )
      );
      const result = await safeParseAsync(schema, input, config);
      expect(visited).toStrictEqual(expectedVisited);
      expect(messages).toStrictEqual(keys.map((key) => input[key]));
      expect(result.success).toBe(false);
      expect(result.typed).toBe(true);
      expect(result.output).toStrictEqual(input);
      expect(result.issues).toHaveLength(keys.length);
      expect(result.issues?.map((issue) => issue.path)).toStrictEqual(
        keys.map((key) => [
          { type: 'array', origin: 'value', input, key, value: input[key] },
        ])
      );
      expect(result.issues?.map((issue) => issue.message)).toStrictEqual(
        keys.map((key) => `Invalid item: ${input[key]}`)
      );
    });

    test.each([{ input: [] }, { input: [1, 2, 3] }])(
      'should accept valid input %j with abortEarly',
      async ({ input }) => {
        const schema = pipeAsync(
          array(number()),
          checkItemsAsync<number[]>(async (item) => item > 0)
        );
        expect(
          await safeParseAsync(schema, input, { abortEarly: true })
        ).toStrictEqual({
          typed: true,
          success: true,
          output: input,
          issues: undefined,
        });
      }
    );
  });
});
