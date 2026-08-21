import { describe, expectTypeOf, test } from 'vitest';
import type {
  ArraySchema,
  ArraySchemaAsync,
  NumberIssue,
  NumberSchema,
  ObjectSchema,
  ObjectSchemaAsync,
  RecursiveSchemaAsync,
  StringIssue,
  StringSchema,
} from '../../schemas/index.ts';
import type { RecursiveSelfSchemaAsync } from '../../schemas/recursive/recursiveAsync.ts';
import type { ArrayPathItem, ObjectPathItem } from '../../types/index.ts';
import { getDotPath } from './getDotPath.ts';

describe('getDotPath', () => {
  const issue: NumberIssue = {
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
  };
  const recursiveIssue: StringIssue = {
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
  };

  test('should return generic dot path', () => {
    expectTypeOf(getDotPath(issue)).toEqualTypeOf<string | null>();
  });

  test('should return specific dot path', () => {
    type Schema = ObjectSchema<
      {
        dot: ArraySchema<
          ObjectSchema<{ path: NumberSchema<undefined> }, undefined>,
          undefined
        >;
      },
      undefined
    >;
    expectTypeOf(getDotPath<Schema>(issue)).toEqualTypeOf<
      'dot' | `dot.${number}` | `dot.${number}.path` | null
    >();
  });

  test('should return recursive dot path', () => {
    type Schema = RecursiveSchemaAsync<
      ObjectSchemaAsync<
        {
          name: StringSchema<undefined>;
          subcategories: ArraySchemaAsync<RecursiveSelfSchemaAsync, undefined>;
        },
        undefined
      >
    >;

    expectTypeOf(getDotPath<Schema>(recursiveIssue)).toEqualTypeOf<
      | 'name'
      | 'subcategories'
      | `subcategories.${number}`
      | `subcategories.${number}.${string}`
      | null
    >();
  });
});
