import { describe, expect, test } from 'vitest';
import { transformAsync } from '../../actions/index.ts';
import { pipeAsync } from '../../methods/index.ts';
import type {
  ObjectWithPatternsIssue,
  ObjectWithPatternsSchemaAsync,
} from '../../schemas/index.ts';
import {
  boolean,
  customAsync,
  never,
  number,
  objectAsync,
  objectWithPatternsAsync,
  string,
} from '../../schemas/index.ts';
import { FailureDataset } from '../../types/dataset.ts';
import { InferIssue } from '../../types/infer.ts';
import {
  expectNoSchemaIssueAsync,
  expectSchemaIssueAsync,
} from '../../vitest/index.ts';

const FooKeySchema = customAsync<`foo(${string})`>(
  async (input) =>
    typeof input === 'string' && input.startsWith('foo(') && input.endsWith(')')
);

const BarKeySchema = pipeAsync(
  customAsync<`bar(${string})`>(
    async (input) =>
      typeof input === 'string' &&
      input.startsWith('bar(') &&
      input.endsWith(')')
  ),
  transformAsync(
    async (input) => input.toUpperCase() as Uppercase<typeof input>
  )
);

describe('objectWithPatternsAsync', () => {
  describe('should  return schema object', () => {
    const patterns = [
      [FooKeySchema, string()],
      [BarKeySchema, number()],
    ] as const;
    type Patterns = typeof patterns;
    const rest = boolean();
    type Rest = typeof rest;
    const baseSchema: Omit<
      ObjectWithPatternsSchemaAsync<Patterns, Rest, never>,
      'message'
    > = {
      kind: 'schema',
      type: 'object_with_patterns',
      reference: objectWithPatternsAsync,
      expects: 'Object',
      patterns,
      rest,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };
    test('without message', () => {
      expect(objectWithPatternsAsync(patterns, rest)).toStrictEqual({
        ...baseSchema,
        message: undefined,
      });
    });

    test('with string message', () => {
      expect(objectWithPatternsAsync(patterns, rest, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      });
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(objectWithPatternsAsync(patterns, rest, message)).toStrictEqual({
        ...baseSchema,
        message,
      });
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', async () => {
      await expectNoSchemaIssueAsync(
        objectWithPatternsAsync([[FooKeySchema, string()]], string()),
        [{}]
      );
    });
    test('for simple object', async () => {
      expect(
        await objectWithPatternsAsync(
          [
            [FooKeySchema, string()],
            [BarKeySchema, number()],
          ],
          boolean()
        )['~run'](
          { value: { 'foo(bar)': 'foo', 'bar(baz)': 123, other: true } },
          {}
        )
      ).toEqual({
        typed: true,
        value: { 'foo(bar)': 'foo', 'BAR(BAZ)': 123, other: true },
      });
    });
  });

  describe('should return dataset with issues', () => {
    const schema = objectWithPatternsAsync(
      [[FooKeySchema, string()]],
      never(),
      'message'
    );
    const baseIssue: Omit<ObjectWithPatternsIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'object_with_patterns',
      expected: 'Object',
      message: 'message',
    };

    // for primitive types

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

    test('for strings', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, ['foo', 'bar', 'baz']);
    });

    test('for symbols', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        Symbol('foo'),
        Symbol('bar'),
        Symbol('baz'),
      ]);
    });

    // complex types

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
        objectWithPatternsAsync([[FooKeySchema, string()]], boolean()),
        // @ts-expect-error
        [{ 'foo(bar)': 'foo', other: true }]
      );
    });

    test('for nested object', async () => {
      await expectNoSchemaIssueAsync(
        objectWithPatternsAsync(
          [[FooKeySchema, objectAsync({ key: string() })]],
          objectAsync({ key: number() })
        ),
        // @ts-expect-error
        [{ 'foo(bar)': { key: 'foo' }, other: { key: 123 } }]
      );
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = objectWithPatternsAsync(
      [
        [FooKeySchema, string()],
        [BarKeySchema, objectAsync({ key: number() })],
      ],
      objectAsync({ key: number() }),
      'message'
    );

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for invalid entries', async () => {
      const input = { 'foo(bar)': false, other: 'foo' };
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
                key: 'foo(bar)',
                value: false,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: 'foo',
            expected: 'Object',
            received: '"foo"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: 'foo',
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid nested entries', async () => {
      const input = { 'bar(baz)': { key: '123' } };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: { 'BAR(BAZ)': { key: '123' } },
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: '123',
            expected: 'number',
            received: '"123"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'bar(baz)',
                value: input['bar(baz)'],
              },
              {
                type: 'object',
                origin: 'value',
                input: input['bar(baz)'],
                key: 'key',
                value: '123',
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
    test('for wrong rest', async () => {
      const input = { 'foo(bar)': 'foo', other: 'foo' };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: 'foo',
            expected: 'Object',
            received: '"foo"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: 'foo',
              },
            ],
          },
        ],
      });
    });
    test('for wrong nested rest', async () => {
      const input = { other: { key: 'foo' } };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: 'foo',
            expected: 'number',
            received: '"foo"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
              {
                type: 'object',
                origin: 'value',
                input: input.other,
                key: 'key',
                value: 'foo',
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });
});
