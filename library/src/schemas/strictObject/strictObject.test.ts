import { describe, expect, test } from 'vitest';
import { fallback } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { any } from '../any/index.ts';
import { exactOptional } from '../exactOptional/index.ts';
import { nullish } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { object } from '../object/index.ts';
import { optional } from '../optional/index.ts';
import { string } from '../string/index.ts';
import { unknown } from '../unknown/index.ts';
import { strictObject, type StrictObjectSchema } from './strictObject.ts';
import type { StrictObjectIssue } from './types.ts';

describe('strictObject', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;
    const baseSchema: Omit<StrictObjectSchema<Entries, never>, 'message'> = {
      kind: 'schema',
      type: 'strict_object',
      reference: strictObject,
      expects: 'Object',
      entries,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: StrictObjectSchema<Entries, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(strictObject(entries)).toStrictEqual(schema);
      expect(strictObject(entries, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(strictObject(entries, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies StrictObjectSchema<Entries, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(strictObject(entries, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies StrictObjectSchema<Entries, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', () => {
      expectNoSchemaIssue(strictObject({}), [{}]);
    });

    test('for simple object', () => {
      expectNoSchemaIssue(strictObject({ key1: string(), key2: number() }), [
        { key1: 'foo', key2: 123 },
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const schema = strictObject({}, 'message');
    const baseIssue: Omit<StrictObjectIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'strict_object',
      expected: 'Object',
      message: 'message',
    };

    // Primitive types

    test('for bigints', () => {
      expectSchemaIssue(schema, baseIssue, [-1n, 0n, 123n]);
    });

    test('for booleans', () => {
      expectSchemaIssue(schema, baseIssue, [true, false]);
    });

    test('for null', () => {
      expectSchemaIssue(schema, baseIssue, [null]);
    });

    test('for numbers', () => {
      expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
    });

    test('for undefined', () => {
      expectSchemaIssue(schema, baseIssue, [undefined]);
    });

    test('for strings', () => {
      expectSchemaIssue(schema, baseIssue, ['', 'abc', '123']);
    });

    test('for symbols', () => {
      expectSchemaIssue(schema, baseIssue, [Symbol(), Symbol('foo')]);
    });

    // Complex types

    // TODO: Enable this test again in case we find a reliable way to check for
    // plain objects
    // test('for arrays', () => {
    //   expectSchemaIssue(schema, baseIssue, [[], ['value']]);
    // });

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
    });
  });

  describe('should return dataset without nested issues', () => {
    test('for simple object', () => {
      expectNoSchemaIssue(strictObject({ key1: string(), key2: number() }), [
        { key1: 'foo', key2: 123 },
      ]);
    });

    test('for nested object', () => {
      expectNoSchemaIssue(strictObject({ nested: object({ key: string() }) }), [
        { nested: { key: 'foo' } },
      ]);
    });

    test('for missing entries with fallback', () => {
      expect(
        strictObject({
          key1: fallback(string(), 'foo'),
          key2: fallback(number(), () => 123),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo', key2: 123 },
      });
    });

    test('for exact optional entry', () => {
      expectNoSchemaIssue(strictObject({ key: exactOptional(string()) }), [
        {},
        { key: 'foo' },
      ]);
    });

    test('for exact optional entry with default', () => {
      expect(
        strictObject({ key: exactOptional(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        strictObject({ key: exactOptional(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
    });

    test('for optional entry', () => {
      expectNoSchemaIssue(strictObject({ key: optional(string()) }), [
        {},
        { key: undefined },
        { key: 'foo' },
      ]);
    });

    test('for optional entry with default', () => {
      expect(
        strictObject({ key: optional(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        strictObject({ key: optional(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        strictObject({
          key: optional(string(), () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });

    test('for nullish entry', () => {
      expectNoSchemaIssue(strictObject({ key: nullish(number()) }), [
        {},
        { key: undefined },
        { key: null },
        { key: 123 },
      ]);
    });

    test('for nullish entry with default', () => {
      expect(
        strictObject({ key: nullish(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        strictObject({ key: nullish(string(), null) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        strictObject({ key: nullish(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        strictObject({ key: nullish(string(), () => null) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        strictObject({ key: nullish(string(), () => undefined) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = strictObject({
      key1: string(),
      key2: number(),
      nested: strictObject({ key1: string(), key2: number() }),
    });

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for missing entries', () => {
      const input = { key2: 123 };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'key1',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"nested"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'nested',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing nested entries', () => {
      const input = { key1: 'value', nested: {} };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'key2',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: {},
              },
              {
                type: 'object',
                origin: 'key',
                input: input.nested,
                key: 'key1',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: {},
              },
              {
                type: 'object',
                origin: 'key',
                input: input.nested,
                key: 'key2',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing entries with abort early', () => {
      const input = { key2: 123 };
      expect(
        schema['~run']({ value: input }, { abortEarly: true })
      ).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'key1',
                value: undefined,
              },
            ],
            abortEarly: true,
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing any and unknown entry', () => {
      const schema = strictObject({ key1: any(), key2: unknown() });
      expect(schema['~run']({ value: {} }, {})).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input: {},
                key: 'key1',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input: {},
                key: 'key2',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid entries', () => {
      const input = { key1: false, key2: 123, nested: null };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: false,
            expected: 'string',
            received: 'false',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key1',
                value: false,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: null,
            expected: 'Object',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: null,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid nested entries', () => {
      const input = {
        key1: 'value',
        key2: 'value',
        nested: {
          key1: 123,
          key2: null,
        },
      };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: 'value',
            expected: 'number',
            received: '"value"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key2',
                value: input.key2,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: 123,
            expected: 'string',
            received: '123',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: input.nested,
              },
              {
                type: 'object',
                origin: 'value',
                input: input.nested,
                key: 'key1',
                value: input.nested.key1,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: null,
            expected: 'number',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: input.nested,
              },
              {
                type: 'object',
                origin: 'value',
                input: input.nested,
                key: 'key2',
                value: input.nested.key2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid entries with abort early', () => {
      const input = { key1: false, key2: 123, nested: null };
      expect(
        schema['~run']({ value: input }, { abortEarly: true })
      ).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: false,
            expected: 'string',
            received: 'false',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key1',
                value: false,
              },
            ],
            abortEarly: true,
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid exact optional entry', () => {
      const schema = strictObject({ key: exactOptional(string()) });
      const input = { key: undefined };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: undefined,
            expected: 'string',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for unknown entries', () => {
      const input = {
        key1: 'foo',
        key2: 123,
        nested: { key1: 'foo', key2: 123 },
        other1: 'foo',
        other2: 123,
      };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: { key1: 'foo', key2: 123, nested: { key1: 'foo', key2: 123 } },
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: 'other1',
            expected: 'never',
            received: '"other1"',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'other1',
                value: input.other1,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });

  describe('should reject keys colliding with the object prototype', () => {
    const schema = strictObject({ key: string() });

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for unknown key named like an object prototype member', () => {
      const input = { key: 'foo', toString: 'bar' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: { key: 'foo' },
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'strict_object',
            input: 'toString',
            expected: 'never',
            received: '"toString"',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'toString',
                value: input.toString,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });
});
