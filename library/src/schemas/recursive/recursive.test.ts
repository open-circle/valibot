import { describe, expect, test, vi } from 'vitest';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue } from '../../vitest/index.ts';
import { array } from '../array/index.ts';
import { object } from '../object/index.ts';
import { string } from '../string/index.ts';
import {
  recursive,
  type RecursiveSchema,
  type RecursiveSelfSchema,
} from './recursive.ts';

describe('recursive', () => {
  test('should return schema object', () => {
    const getter = (self: RecursiveSelfSchema) =>
      object({
        name: string(),
        subcategories: array(self),
      });
    expect(recursive(getter)).toStrictEqual({
      kind: 'schema',
      type: 'recursive',
      reference: recursive,
      expects: 'unknown',
      getter,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    } satisfies RecursiveSchema<ReturnType<typeof getter>>);
  });

  describe('should return dataset without issues', () => {
    const schema = recursive((self) =>
      object({
        name: string(),
        subcategories: array(self),
      })
    );

    test('for recursive objects', () => {
      expectNoSchemaIssue(schema, [
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

    test('for nested recursive schemas', () => {
      const schema = recursive((category) =>
        object({
          name: string(),
          subcategories: array(category),
          links: array(
            recursive((link) =>
              object({
                name: string(),
                target: category,
                alternatives: array(link),
              })
            )
          ),
        })
      );
      const input = {
        name: 'Root',
        subcategories: [{ name: 'Child', subcategories: [], links: [] }],
        links: [
          {
            name: 'Primary',
            target: { name: 'Target', subcategories: [], links: [] },
            alternatives: [
              {
                name: 'Fallback',
                target: {
                  name: 'Fallback target',
                  subcategories: [],
                  links: [],
                },
                alternatives: [],
              },
            ],
          },
        ],
      };

      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: true,
        value: input,
      });
    });
  });

  test('should return dataset with nested issues', () => {
    const schema = recursive((self) =>
      object({
        name: string('message'),
        subcategories: array(self),
      })
    );
    const input = {
      name: 'Root',
      subcategories: [{ name: 123, subcategories: [] }],
    };
    expect(schema['~run']({ value: input }, {})).toStrictEqual({
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

  test('should call getter with self', () => {
    const getter = vi.fn((self: RecursiveSelfSchema) => {
      expect(self.type).toBe('recursive');
      return string();
    });
    const schema = recursive(getter);
    expect(getter).not.toHaveBeenCalled();
    schema['~run']({ value: 'foo' }, {});
    expect(getter).toHaveBeenCalledTimes(1);
    expect(getter).toHaveBeenCalledWith(schema);
  });
});
