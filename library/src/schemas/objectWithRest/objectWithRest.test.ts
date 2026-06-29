import { describe, expect, test } from 'vitest';
import { fallback } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { any } from '../any/index.ts';
import { array } from '../array/array.ts';
import type { ArrayIssue } from '../array/types.ts';
import { boolean } from '../boolean/index.ts';
import { exactOptional } from '../exactOptional/index.ts';
import { never } from '../never/index.ts';
import { nullish } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { object } from '../object/index.ts';
import { optional } from '../optional/index.ts';
import { string } from '../string/index.ts';
import { unknown } from '../unknown/index.ts';
import { objectWithRest, type ObjectWithRestSchema } from './objectWithRest.ts';
import type { ObjectWithRestIssue } from './types.ts';

describe('objectWithRest', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;
    const rest = number();
    type Rest = typeof rest;
    const baseSchema: Omit<
      ObjectWithRestSchema<Entries, Rest, never>,
      'message'
    > = {
      kind: 'schema',
      type: 'object_with_rest',
      reference: objectWithRest,
      expects: 'Object',
      entries,
      rest,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: ObjectWithRestSchema<Entries, Rest, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(objectWithRest(entries, rest)).toStrictEqual(schema);
      expect(objectWithRest(entries, rest, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(objectWithRest(entries, rest, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies ObjectWithRestSchema<Entries, Rest, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(objectWithRest(entries, rest, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies ObjectWithRestSchema<Entries, Rest, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', () => {
      expectNoSchemaIssue(objectWithRest({}, boolean()), [{}]);
    });

    test('for simple object', () => {
      expectNoSchemaIssue(
        objectWithRest({ key1: string(), key2: number() }, boolean()),
        // @ts-expect-error
        [{ key1: 'foo', key2: 123, other: true }]
      );
    });
  });

  describe('should return dataset with issues', () => {
    const schema = objectWithRest({}, never(), 'message');
    const baseIssue: Omit<ObjectWithRestIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'object_with_rest',
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
      expectNoSchemaIssue(
        objectWithRest({ key1: string(), key2: number() }, boolean()),
        // @ts-expect-error
        [{ key1: 'foo', key2: 123, other: true }]
      );
    });

    test('for nested object', () => {
      expectNoSchemaIssue(
        objectWithRest(
          { nested: object({ key: string() }) },
          object({ key: number() })
        ),
        // @ts-expect-error
        [{ nested: { key: 'foo' }, other: { key: 123 } }]
      );
    });

    test('for missing entries with fallback', () => {
      expect(
        objectWithRest(
          {
            key1: fallback(string(), 'foo'),
            key2: fallback(number(), () => 123),
          },
          boolean()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo', key2: 123 },
      });
    });

    test('for exact optional entry', () => {
      expectNoSchemaIssue(
        objectWithRest({ key: exactOptional(string()) }, number()),
        // @ts-expect-error
        [{}, { key: 'foo' }]
      );
    });

    test('for exact optional entry with default', () => {
      expect(
        objectWithRest({ key: exactOptional(string(), 'foo') }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        objectWithRest({ key: exactOptional(string(), () => 'foo') }, number())[
          '~run'
        ]({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo', other: 123 },
      });
    });

    test('for optional entry', () => {
      expectNoSchemaIssue(
        objectWithRest({ key: optional(string()) }, number()),
        // @ts-expect-error
        [{}, { key: undefined, other: 123 }, { key: 'foo' }]
      );
    });

    test('for optional entry with default', () => {
      expect(
        objectWithRest({ key: optional(string(), 'foo') }, number())['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        objectWithRest({ key: optional(string(), () => 'foo') }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        objectWithRest({ key: optional(string(), () => undefined) }, number())[
          '~run'
        ]({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined, other: 123 },
      });
    });

    test('for nullish entry', () => {
      expectNoSchemaIssue(
        objectWithRest({ key: nullish(number()) }, number()),
        // @ts-expect-error
        [{}, { key: undefined }, { key: null, other: 123 }, { key: 123 }]
      );
    });

    test('for nullish entry with default', () => {
      expect(
        objectWithRest({ key: nullish(string(), 'foo') }, number())['~run'](
          { value: { other: 123 } },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo', other: 123 },
      });
      expect(
        objectWithRest({ key: nullish(string(), null) }, number())['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        objectWithRest({ key: nullish(string(), () => 'foo') }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        objectWithRest({ key: nullish(string(), () => null) }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        objectWithRest({ key: nullish(string(), () => undefined) }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = objectWithRest(
      {
        key1: string(),
        key2: number(),
        nested: objectWithRest({ key1: string(), key2: number() }, number()),
      },
      array(boolean())
    );

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for missing entries', () => {
      const input = { key2: 123, other: [true, false] };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object_with_rest',
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
            type: 'object_with_rest',
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
      const input = { key1: 'value', nested: { other: 123 } };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object_with_rest',
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
            type: 'object_with_rest',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
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
            type: 'object_with_rest',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
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
            type: 'object_with_rest',
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
      const schema = objectWithRest({ key1: any(), key2: unknown() }, number());
      expect(schema['~run']({ value: {} }, {})).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object_with_rest',
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
            type: 'object_with_rest',
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
      const input = { key1: false, key2: 123, nested: null, other: [false] };
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
            type: 'object_with_rest',
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
          other: 123,
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
      const schema = objectWithRest({ key: exactOptional(string()) }, number());
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

    const arrayIssue: ArrayIssue = {
      ...baseInfo,
      kind: 'schema',
      type: 'array',
      input: null,
      expected: 'Array',
      received: 'null',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: {
            key1: 'foo',
            key2: 123,
            nested: { key1: 'foo', key2: 123 },
            other1: null,
            other2: 'bar',
          },
          key: 'other1',
          value: null,
        },
      ],
    };

    test('for wrong rest', () => {
      const input = {
        key1: 'foo',
        key2: 123,
        nested: { key1: 'foo', key2: 123 },
        other1: null,
        other2: 'bar',
      };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          arrayIssue,
          {
            ...baseInfo,
            kind: 'schema',
            type: 'array',
            input: 'bar',
            expected: 'Array',
            received: '"bar"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other2',
                value: input.other2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for wrong rest with abort early', () => {
      expect(
        schema['~run'](
          {
            value: {
              key1: 'foo',
              key2: 123,
              nested: { key1: 'foo', key2: 123 },
              other1: null,
              other2: 'bar',
            },
          },
          { abortEarly: true }
        )
      ).toStrictEqual({
        typed: false,
        value: {
          key1: 'foo',
          key2: 123,
          nested: { key1: 'foo', key2: 123 },
        },
        issues: [{ ...arrayIssue, abortEarly: true }],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for wrong nested rest', () => {
      const input = {
        key1: 'foo',
        key2: 123,
        nested: { key1: 'foo', key2: 123 },
        other: ['true'],
      };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'boolean',
            input: 'true',
            expected: 'boolean',
            received: '"true"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
              {
                type: 'array',
                origin: 'value',
                input: input.other,
                key: 0,
                value: input.other[0],
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });

  describe('should apply rest to keys colliding with the object prototype', () => {
    const schema = objectWithRest({ key: string() }, number());

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
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: 'bar',
            expected: 'number',
            received: '"bar"',
            path: [
              {
                type: 'object',
                origin: 'value',
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
