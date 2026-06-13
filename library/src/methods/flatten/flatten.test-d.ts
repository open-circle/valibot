import { describe, expectTypeOf, test } from 'vitest';
import type {
  ArraySchema,
  NumberIssue,
  NumberSchema,
  ObjectSchema,
  RecursiveSchema,
  StringIssue,
  StringSchema,
} from '../../schemas/index.ts';
import type { RecursiveSelfSchema } from '../../schemas/recursive/recursive.ts';
import type { ArrayPathItem, ObjectPathItem } from '../../types/index.ts';
import { flatten } from './flatten.ts';

describe('flatten', () => {
  const issues: [NumberIssue] = [
    {
      kind: 'schema',
      type: 'number',
      input: 'foo',
      expected: 'number',
      received: '"foo"',
      message: 'Invalid type: Expected number but received "foo"',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: { dot: [{ path: 'foo' }] },
          key: 'dot',
          value: [{ path: 'foo' }],
        } satisfies ObjectPathItem,
        {
          type: 'array',
          origin: 'value',
          input: [{ path: 'foo' }],
          key: 0,
          value: { path: 'foo' },
        } satisfies ArrayPathItem,
        {
          type: 'object',
          origin: 'value',
          input: { path: 'foo' },
          key: 'path',
          value: 'foo',
        } satisfies ObjectPathItem,
      ],
      abortEarly: undefined,
      abortPipeEarly: undefined,
      issues: undefined,
      lang: undefined,
    },
  ];
  const recursiveIssues: [StringIssue] = [
    {
      kind: 'schema',
      type: 'string',
      input: 123,
      expected: 'string',
      received: '123',
      message: 'Invalid type: Expected string but received 123',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: { subcategories: [{ name: 123 }] },
          key: 'subcategories',
          value: [{ name: 123 }],
        } satisfies ObjectPathItem,
        {
          type: 'array',
          origin: 'value',
          input: [{ name: 123 }],
          key: 0,
          value: { name: 123 },
        } satisfies ArrayPathItem,
        {
          type: 'object',
          origin: 'value',
          input: { name: 123 },
          key: 'name',
          value: 123,
        } satisfies ObjectPathItem,
      ],
      abortEarly: undefined,
      abortPipeEarly: undefined,
      issues: undefined,
      lang: undefined,
    },
  ];

  test('should return generic flat errors', () => {
    expectTypeOf(flatten(issues)).toEqualTypeOf<{
      readonly root?: [string, ...string[]];
      readonly nested?: Readonly<
        Partial<Record<string, [string, ...string[]]>>
      >;
      readonly other?: [string, ...string[]];
    }>();
  });

  test('should return specific flat errors', () => {
    type Schema = ObjectSchema<
      {
        dot: ArraySchema<
          ObjectSchema<{ path: NumberSchema<undefined> }, undefined>,
          undefined
        >;
      },
      undefined
    >;
    expectTypeOf(flatten<Schema>(issues)).toEqualTypeOf<{
      readonly root?: [string, ...string[]];
      readonly nested?: Readonly<
        Partial<
          Record<
            'dot' | `dot.${number}` | `dot.${number}.path`,
            [string, ...string[]]
          >
        >
      >;
      readonly other?: [string, ...string[]];
    }>();
  });

  test('should return recursive flat errors', () => {
    type Schema = RecursiveSchema<
      ObjectSchema<
        {
          name: StringSchema<undefined>;
          subcategories: ArraySchema<RecursiveSelfSchema, undefined>;
        },
        undefined
      >
    >;

    expectTypeOf(flatten<Schema>(recursiveIssues)).toEqualTypeOf<{
      readonly root?: [string, ...string[]];
      readonly nested?: Readonly<
        Partial<
          Record<
            | 'name'
            | 'subcategories'
            | `subcategories.${number}`
            | `subcategories.${number}.${string}`,
            [string, ...string[]]
          >
        >
      >;
      readonly other?: [string, ...string[]];
    }>();
  });

  test('should accept readonly list of errors', () => {
    const readonlyIssues = issues as Readonly<typeof issues>;
    expectTypeOf(flatten(readonlyIssues)).toEqualTypeOf<{
      readonly root?: [string, ...string[]];
      readonly nested?: Readonly<
        Partial<Record<string, [string, ...string[]]>>
      >;
      readonly other?: [string, ...string[]];
    }>();
  });
});
