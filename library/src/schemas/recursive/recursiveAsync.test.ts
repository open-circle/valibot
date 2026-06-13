import { describe, expect, test, vi } from 'vitest';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssueAsync } from '../../vitest/index.ts';
import { arrayAsync } from '../array/index.ts';
import { objectAsync } from '../object/index.ts';
import { string } from '../string/index.ts';
import {
  recursiveAsync,
  type RecursiveSchemaAsync,
  type RecursiveSelfSchemaAsync,
} from './recursiveAsync.ts';

describe('recursiveAsync', () => {
  test('should return schema object', () => {
    const getter = (self: RecursiveSelfSchemaAsync) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
      });
    expect(recursiveAsync(getter)).toStrictEqual({
      kind: 'schema',
      type: 'recursive',
      reference: recursiveAsync,
      expects: 'unknown',
      getter,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    } satisfies RecursiveSchemaAsync<ReturnType<typeof getter>>);
  });

  describe('should return dataset without issues', () => {
    const schema = recursiveAsync((self) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
      })
    );

    test('for recursive objects', async () => {
      await expectNoSchemaIssueAsync(schema, [
        { name: 'Root', subcategories: [] },
        {
          name: 'Root',
          subcategories: [
            {
              name: 'Child',
              subcategories: [{ name: 'Grandchild', subcategories: [] }],
            },
          ],
        },
      ]);
    });
  });

  test('should return dataset with nested issues', async () => {
    const schema = recursiveAsync((self) =>
      objectAsync({
        name: string('message'),
        subcategories: arrayAsync(self),
      })
    );
    const input = {
      name: 'Root',
      subcategories: [{ name: 123, subcategories: [] }],
    };
    await expect(schema['~run']({ value: input }, {})).resolves.toStrictEqual({
      typed: false,
      value: input,
      issues: [
        {
          kind: 'schema',
          type: 'string',
          input: 123,
          expected: 'string',
          received: '123',
          message: 'message',
          requirement: undefined,
          path: [
            {
              type: 'object',
              origin: 'value',
              input,
              key: 'subcategories',
              value: input.subcategories,
            },
            {
              type: 'array',
              origin: 'value',
              input: input.subcategories,
              key: 0,
              value: input.subcategories[0],
            },
            {
              type: 'object',
              origin: 'value',
              input: input.subcategories[0],
              key: 'name',
              value: 123,
            },
          ],
          issues: undefined,
          lang: undefined,
          abortEarly: undefined,
          abortPipeEarly: undefined,
        },
      ],
    } satisfies FailureDataset<InferIssue<typeof schema>>);
  });

  test('should call getter with self', async () => {
    const getter = vi.fn((self: RecursiveSelfSchemaAsync) => {
      expect(self.type).toBe('recursive');
      return string();
    });
    const schema = recursiveAsync(getter);
    expect(getter).not.toHaveBeenCalled();
    await schema['~run']({ value: 'foo' }, {});
    expect(getter).toHaveBeenCalledTimes(1);
    expect(getter).toHaveBeenCalledWith(schema);
  });

  test('should support async getters', async () => {
    const schema = recursiveAsync(async () => string());
    await expectNoSchemaIssueAsync(schema, ['foo']);
  });
});
