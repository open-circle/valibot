import { describe, expect, test } from 'vitest';
import { checkAsync } from '../../actions/index.ts';
import { fallback, fallbackAsync, pipeAsync } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import {
  expectNoSchemaIssueAsync,
  expectSchemaIssueAsync,
} from '../../vitest/index.ts';
import { any } from '../any/index.ts';
import { exactOptional, exactOptionalAsync } from '../exactOptional/index.ts';
import { nullish, nullishAsync } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { objectAsync } from '../object/index.ts';
import { optional, optionalAsync } from '../optional/index.ts';
import { string } from '../string/index.ts';
import { unknown } from '../unknown/index.ts';
import {
  looseObjectAsync,
  type LooseObjectSchemaAsync,
} from './looseObjectAsync.ts';
import type { LooseObjectIssue } from './types.ts';

describe('looseObjectAsync', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;
    const baseSchema: Omit<
      LooseObjectSchemaAsync<Entries, never>,
      'message'
    > = {
      kind: 'schema',
      type: 'loose_object',
      reference: looseObjectAsync,
      expects: 'Object',
      entries,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: LooseObjectSchemaAsync<Entries, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(looseObjectAsync(entries)).toStrictEqual(schema);
      expect(looseObjectAsync(entries, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(looseObjectAsync(entries, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies LooseObjectSchemaAsync<Entries, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(looseObjectAsync(entries, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies LooseObjectSchemaAsync<Entries, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', async () => {
      await expectNoSchemaIssueAsync(looseObjectAsync({}), [{}]);
    });

    test('for simple object', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key1: string(), key2: number() }),
        [{ key1: 'foo', key2: 123 }]
      );
    });

    test('for unknown entries', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key1: string(), key2: number() }),
        [{ key1: 'foo', key2: 123, other1: 'bar', other2: null }]
      );
    });
  });

  describe('should return dataset with issues', () => {
    const schema = looseObjectAsync({}, 'message');
    const baseIssue: Omit<LooseObjectIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'loose_object',
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
        looseObjectAsync({ key1: string(), key2: number() }),
        [{ key1: 'foo', key2: 123 }]
      );
    });

    test('for nested object', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ nested: objectAsync({ key: string() }) }),
        [{ nested: { key: 'foo' } }]
      );
    });

    test('for missing entries with fallback', async () => {
      expect(
        await looseObjectAsync({
          key1: fallback(string(), 'foo'),
          key2: fallback(number(), () => 123),
          key3: fallbackAsync(string(), 'bar'),
          key4: fallbackAsync(number(), () => 456),
          key5: fallbackAsync(string(), async () => 'baz'),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo', key2: 123, key3: 'bar', key4: 456, key5: 'baz' },
      });
    });

    test('for exact optional entry', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key: exactOptional(string()) }),
        [{}, { key: 'foo' }]
      );
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key: exactOptionalAsync(string()) }),
        [{}, { key: 'foo' }]
      );
    });

    test('for exact optional entry with default', async () => {
      // Sync
      expect(
        await looseObjectAsync({ key: exactOptional(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: exactOptional(string(), () => 'foo') })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });

      // Async
      expect(
        await looseObjectAsync({ key: exactOptionalAsync(string(), 'foo') })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({
          key: exactOptionalAsync(string(), () => 'foo'),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
    });

    test('for optional entry', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key: optional(string()) }),
        [{}, { key: undefined }, { key: 'foo' }]
      );
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key: optionalAsync(string()) }),
        [{}, { key: undefined }, { key: 'foo' }]
      );
    });

    test('for optional entry with default', async () => {
      // Sync
      expect(
        await looseObjectAsync({ key: optional(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: optional(string(), () => 'foo') })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({
          key: optional(string(), () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });

      // Async
      expect(
        await looseObjectAsync({ key: optionalAsync(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: optionalAsync(string(), () => 'foo') })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({
          key: optionalAsync(string(), () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
      expect(
        await looseObjectAsync({
          key: optionalAsync(string(), async () => 'foo'),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({
          key: optionalAsync(string(), async () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });

    test('for nullish entry', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key: nullish(number()) }),
        [{}, { key: undefined }, { key: null }, { key: 123 }]
      );
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key: nullishAsync(number()) }),
        [{}, { key: undefined }, { key: null }, { key: 123 }]
      );
    });

    test('for nullish entry with default', async () => {
      // Sync
      expect(
        await looseObjectAsync({ key: nullish(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: nullish(string(), null) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await looseObjectAsync({ key: nullish(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: nullish(string(), () => null) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await looseObjectAsync({ key: nullish(string(), () => undefined) })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });

      // Async
      expect(
        await looseObjectAsync({ key: nullishAsync(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: nullishAsync(string(), null) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await looseObjectAsync({ key: nullishAsync(string(), () => 'foo') })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({ key: nullishAsync(string(), () => null) })[
          '~run'
        ]({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await looseObjectAsync({
          key: nullishAsync(string(), () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
      expect(
        await looseObjectAsync({
          key: nullishAsync(string(), async () => 'foo'),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        await looseObjectAsync({
          key: nullishAsync(string(), async () => null),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        await looseObjectAsync({
          key: nullishAsync(string(), async () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });

    test('for unknown entries', async () => {
      await expectNoSchemaIssueAsync(
        looseObjectAsync({ key1: string(), key2: number() }),
        [{ key1: 'foo', key2: 123, other1: 'bar', other2: null }]
      );
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = looseObjectAsync({
      key1: string(),
      key2: number(),
      nested: looseObjectAsync({ key1: string(), key2: number() }),
    });

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for missing entries', async () => {
      const input = { key2: 123 };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'loose_object',
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
            type: 'loose_object',
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
      const input = { key1: 'value', nested: {} };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'loose_object',
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
            type: 'loose_object',
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
            type: 'loose_object',
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
            type: 'loose_object',
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
      const schema = looseObjectAsync({
        key1: pipeAsync(
          string(),
          checkAsync(async () => {
            calls.push('key1');
            return false;
          }, 'message')
        ),
        key2: pipeAsync(
          string(),
          checkAsync(async () => {
            calls.push('key2');
            return true;
          })
        ),
      });

      await schema['~run'](
        { value: { key1: 'foo', key2: 'bar' } },
        { abortEarly: true }
      );

      expect(calls).toStrictEqual(['key1']);
    });

    test('for missing any and unknown entry', async () => {
      const schema = looseObjectAsync({ key1: any(), key2: unknown() });
      expect(await schema['~run']({ value: {} }, {})).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'loose_object',
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
            type: 'loose_object',
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
      const input = { key1: false, key2: 123, nested: null };
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
            type: 'loose_object',
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
      const schema = looseObjectAsync({
        key1: exactOptional(string()),
        key2: exactOptionalAsync(string()),
      });
      const input = { key1: undefined, key2: undefined };
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
                key: 'key1',
                value: undefined,
              },
            ],
          },
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
                key: 'key2',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });
});
