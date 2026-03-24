import { describe, expect, test } from 'vitest';
import { checkAsync } from '../../actions/index.ts';
import { fallback, fallbackAsync, pipeAsync } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import {
  expectNoSchemaIssueAsync,
  expectSchemaIssueAsync,
} from '../../vitest/index.ts';
import { any } from '../any/index.ts';
import { array } from '../array/array.ts';
import type { ArrayIssue } from '../array/types.ts';
import { boolean } from '../boolean/index.ts';
import { exactOptional, exactOptionalAsync } from '../exactOptional/index.ts';
import { never } from '../never/index.ts';
import { nullish, nullishAsync } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { object, objectAsync } from '../object/index.ts';
import { optional, optionalAsync } from '../optional/index.ts';
import { string } from '../string/index.ts';
import { unknown } from '../unknown/index.ts';
import {
  objectWithRestAsync,
  type ObjectWithRestSchemaAsync,
} from './objectWithRestAsync.ts';
import type { ObjectWithRestIssue } from './types.ts';

describe('objectWithRestAsync', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;
    const rest = number();
    type Rest = typeof rest;
    const baseSchema: Omit<
      ObjectWithRestSchemaAsync<Entries, Rest, never>,
      'message'
    > = {
      kind: 'schema',
      type: 'object_with_rest',
      reference: objectWithRestAsync,
      expects: 'Object',
      entries,
      rest,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: ObjectWithRestSchemaAsync<Entries, Rest, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(objectWithRestAsync(entries, rest)).toStrictEqual(schema);
      expect(objectWithRestAsync(entries, rest, undefined)).toStrictEqual(
        schema
      );
    });

    test('with string message', () => {
      expect(objectWithRestAsync(entries, rest, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies ObjectWithRestSchemaAsync<Entries, Rest, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(objectWithRestAsync(entries, rest, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies ObjectWithRestSchemaAsync<Entries, Rest, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', async () => {
      await expectNoSchemaIssueAsync(objectWithRestAsync({}, boolean()), [{}]);
    });

    test('for simple object', async () => {
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key1: string(), key2: number() }, boolean()),
        // @ts-expect-error
        [{ key1: 'foo', key2: 123, other: true }]
      );
    });
  });

  describe('should return dataset with issues', () => {
    const schema = objectWithRestAsync({}, never(), 'message');
    const baseIssue: Omit<ObjectWithRestIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'object_with_rest',
      expected: 'Object',
      message: 'message',
    };

    // Primitive types

    test('for bigints', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [-1n, 0n, 123n]);
    });

    test('for booleans', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [true, false]);
    });

    test('for null', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [null]);
    });

    test('for numbers', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [-1, 0, 123, 45.67]);
    });

    test('for undefined', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
    });

    test('for strings', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, ['', 'abc', '123']);
    });

    test('for symbols', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        Symbol(),
        Symbol('foo'),
      ]);
    });

    // Complex types

    // TODO: Enable this test again in case we find a reliable way to check for
    // plain objects
    // test('for arrays', async () => {
    //   await expectSchemaIssueAsync(schema, baseIssue, [[], ['value']]);
    // });

    test('for functions', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        function () {},
      ]);
    });
  });

  describe('should return dataset without nested issues', () => {
    test('for simple object', async () => {
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key1: string(), key2: number() }, boolean()),
        // @ts-expect-error
        [{ key1: 'foo', key2: 123, other: true }]
      );
    });

    test('for nested object', async () => {
      await expectNoSchemaIssueAsync(
        objectWithRestAsync(
          { nested: object({ key: string() }) },
          objectAsync({ key: number() })
        ),
        // @ts-expect-error
        [{ nested: { key: 'foo' }, other: { key: 123 } }]
      );
    });

    test('for missing entries with fallback', async () => {
      expect(
        await objectWithRestAsync(
          {
            key1: fallback(string(), 'foo'),
            key2: fallback(number(), () => 123),
            key3: fallbackAsync(string(), 'bar'),
            key4: fallbackAsync(number(), () => 456),
            key5: fallbackAsync(string(), async () => 'baz'),
          },
          boolean()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo', key2: 123, key3: 'bar', key4: 456, key5: 'baz' },
      });
    });

    test('for exact optional entry', async () => {
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key: exactOptional(string()) }, number()),
        // @ts-expect-error
        [{}, { key: 'foo', other: 123 }]
      );
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key: exactOptionalAsync(string()) }, number()),
        // @ts-expect-error
        [{}, { key: 'foo' }]
      );
    });

    test('for exact optional entry with default', async () => {
      // Sync
      expect(
        await objectWithRestAsync(
          { key: exactOptional(string(), 'foo') },
          number()
        )['~run']({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo', other: 123 },
      });
      expect(
        await objectWithRestAsync(
          { key: exactOptional(string(), () => 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });

      // Async
      expect(
        await objectWithRestAsync(
          { key: exactOptionalAsync(string(), 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: exactOptionalAsync(string(), () => 'foo') },
          number()
        )['~run']({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo', other: 123 },
      });
    });

    test('for optional entry', async () => {
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key: optional(string()) }, number()),
        // @ts-expect-error
        [{}, { key: undefined, other: 123 }, { key: 'foo' }]
      );
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key: optionalAsync(string()) }, number()),
        // @ts-expect-error
        [{}, { key: undefined, other: 123 }, { key: 'foo' }]
      );
    });

    test('for optional entry with default', async () => {
      // Sync
      expect(
        await objectWithRestAsync({ key: optional(string(), 'foo') }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: optional(string(), () => 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: optional(string(), () => undefined) },
          number()
        )['~run']({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined, other: 123 },
      });

      // Async
      expect(
        await objectWithRestAsync(
          { key: optionalAsync(string(), 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: optionalAsync(string(), () => 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: optionalAsync(string(), () => undefined) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
      expect(
        await objectWithRestAsync(
          { key: optionalAsync(string(), async () => 'foo') },
          number()
        )['~run']({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo', other: 123 },
      });
      expect(
        await objectWithRestAsync(
          { key: optionalAsync(string(), async () => undefined) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });

    test('for nullish entry', async () => {
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key: nullish(number()) }, number()),
        // @ts-expect-error
        [{}, { key: undefined }, { key: null, other: 123 }, { key: 123 }]
      );
      await expectNoSchemaIssueAsync(
        objectWithRestAsync({ key: nullishAsync(number()) }, number()),
        // @ts-expect-error
        [{ other: 123 }, { key: undefined }, { key: null }, { key: 123 }]
      );
    });

    test('for nullish entry with default', async () => {
      // Sync
      expect(
        await objectWithRestAsync({ key: nullish(string(), 'foo') }, number())[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync({ key: nullish(string(), null) }, number())[
          '~run'
        ]({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null, other: 123 },
      });
      expect(
        await objectWithRestAsync(
          { key: nullish(string(), () => 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: nullish(string(), () => null) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await objectWithRestAsync(
          { key: nullish(string(), () => undefined) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });

      // Async
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), null) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), () => 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), () => null) },
          number()
        )['~run']({ value: { other: 123 } }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null, other: 123 },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), () => undefined) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), async () => 'foo') },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), async () => null) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await objectWithRestAsync(
          { key: nullishAsync(string(), async () => undefined) },
          number()
        )['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = objectWithRestAsync(
      {
        key1: string(),
        key2: number(),
        nested: objectWithRestAsync(
          { key1: string(), key2: number() },
          number()
        ),
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

    test('for missing entries', async () => {
      const input = { key2: 123, other: [true, false] };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for missing nested entries', async () => {
      const input = { key1: 'value', nested: { other: 123 } };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for missing entries with abort early', async () => {
      const input = { key2: 123 };
      expect(
        await schema['~run']({ value: input }, { abortEarly: true })
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

    test('for sequential async validation with abort early', async () => {
      const calls: string[] = [];
      const schema = objectWithRestAsync(
        {
          key1: pipeAsync(
            string(),
            checkAsync(async () => {
              calls.push('key1');
              return false;
            }, 'message')
          ),
        },
        pipeAsync(
          string(),
          checkAsync(async () => {
            calls.push('rest');
            return true;
          })
        )
      );

      await schema['~run'](
        { value: { key1: 'foo', other: 'bar' } },
        { abortEarly: true }
      );

      expect(calls).toStrictEqual(['key1']);
    });

    test('for missing any and unknown entry', async () => {
      const schema = objectWithRestAsync(
        { key1: any(), key2: unknown() },
        number()
      );
      expect(await schema['~run']({ value: {} }, {})).toStrictEqual({
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

    test('for invalid entries', async () => {
      const input = { key1: false, key2: 123, nested: null, other: [false] };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for invalid nested entries', async () => {
      const input = {
        key1: 'value',
        key2: 'value',
        nested: {
          key1: 123,
          key2: null,
          other: 123,
        },
      };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for invalid entries with abort early', async () => {
      const input = { key1: false, key2: 123, nested: null };
      expect(
        await schema['~run']({ value: input }, { abortEarly: true })
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

    test('for invalid exact optional entry', async () => {
      const schema = objectWithRestAsync(
        { key: exactOptional(string()) },
        number()
      );
      const input = { key: undefined };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for wrong rest', async () => {
      const input = {
        key1: 'foo',
        key2: 123,
        nested: { key1: 'foo', key2: 123 },
        other1: null,
        other2: 'bar',
      };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for wrong rest with abort early', async () => {
      expect(
        await schema['~run'](
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

    test('for wrong nested rest', async () => {
      const input = {
        key1: 'foo',
        key2: 123,
        nested: { key1: 'foo', key2: 123 },
        other: ['true'],
      };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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
});
