import { describe, expectTypeOf, test } from 'vitest';
import type {
  ArraySchema,
  NumberIssue,
  NumberSchema,
  ObjectSchema,
} from '../../schemas/index.ts';
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
