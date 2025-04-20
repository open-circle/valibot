import { describe, expect, test } from 'vitest';
import { transform } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import {
  boolean,
  custom,
  never,
  number,
  object,
  string,
} from '../../schemas/index.ts';
import type { FailureDataset } from '../../types/dataset.ts';
import type { InferIssue } from '../../types/infer.ts';
import { expectNoSchemaIssue } from '../../vitest/expectNoSchemaIssue.ts';
import { expectSchemaIssue } from '../../vitest/expectSchemaIssue.ts';
import type {
  ObjectWithPatternsIssue,
  ObjectWithPatternsSchema,
} from './objectWithPatterns.ts';
import { objectWithPatterns } from './objectWithPatterns.ts';

const FooKeySchema = custom<`foo(${string})`>(
  (input) =>
    typeof input === 'string' && input.startsWith('foo(') && input.endsWith(')')
);

const BarKeySchema = pipe(
  custom<`bar(${string})`>(
    (input) =>
      typeof input === 'string' &&
      input.startsWith('bar(') &&
      input.endsWith(')')
  ),
  transform((input) => input.toUpperCase() as Uppercase<typeof input>)
);

describe('objectWithPatterns', () => {
  describe('should return schema object', () => {
    const patterns = [
      [FooKeySchema, string()],
      [BarKeySchema, number()],
    ] as const;
    type Patterns = typeof patterns;
    const rest = boolean();
    type Rest = typeof rest;
    const baseSchema: Omit<
      ObjectWithPatternsSchema<Patterns, Rest, never>,
      'message'
    > = {
      kind: 'schema',
      type: 'object_with_patterns',
      reference: objectWithPatterns,
      expects: 'Object',
      patterns,
      rest,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };
    test('without message', () => {
      expect(objectWithPatterns(patterns, rest)).toStrictEqual({
        ...baseSchema,
        message: undefined,
      });
    });
    test('with message', () => {
      expect(objectWithPatterns(patterns, rest, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      });
    });
  });
  describe('should return dataset without issues', () => {
    test('for empty object', () => {
      expectNoSchemaIssue(
        objectWithPatterns([[FooKeySchema, string()]], boolean()),
        [{}]
      );
    });
    test('for simple object', () => {
      expectNoSchemaIssue(
        objectWithPatterns(
          [
            [FooKeySchema, string()],
            [BarKeySchema, number()],
          ],
          boolean()
        ),
        // @ts-expect-error
        [{ 'foo(bar)': 'foo', 'bar(baz)': 123, other: true }]
      );
    });
  });
  describe('should return dataset with issues', () => {
    const schema = objectWithPatterns(
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

    test('for strings', () => {
      expectSchemaIssue(schema, baseIssue, ['foo', 'bar', 'baz']);
    });

    test('for symbols', () => {
      expectSchemaIssue(schema, baseIssue, [
        Symbol('foo'),
        Symbol('bar'),
        Symbol('baz'),
      ]);
    });

    // complex types

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
        objectWithPatterns([[FooKeySchema, string()]], boolean()),
        // @ts-expect-error
        [{ 'foo(bar)': 'foo', other: true }]
      );
    });

    test('for nested object', () => {
      expectNoSchemaIssue(
        objectWithPatterns(
          [[FooKeySchema, object({ key: string() })]],
          object({ key: number() })
        ),
        // @ts-expect-error
        [{ 'foo(bar)': { key: 'foo' }, other: { key: 123 } }]
      );
    });
  });
  describe('should return dataset with nested issues', () => {
    const schema = objectWithPatterns(
      [
        [FooKeySchema, string()],
        [BarKeySchema, object({ key: number() })],
      ],
      object({ key: number() }),
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

    test('for invalid entries', () => {
      const input = { 'foo(bar)': false, 'bar(baz)': '123', other: 'foo' };
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
                key: 'foo(bar)',
                value: false,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: '123',
            expected: 'Object',
            received: '"123"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'bar(baz)',
                value: '123',
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
    test('for invalid nested entries', () => {
      const input = { 'bar(baz)': { key: '123' } };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
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
    test('for invalid entries with abort early', () => {
      const input = { 'foo(bar)': false, 'bar(baz)': '123', other: 'foo' };
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
                key: 'foo(bar)',
                value: false,
              },
            ],
            abortEarly: true,
          },
        ],
      });
    });
    test('for wrong rest', () => {
      const input = { 'foo(bar)': 'foo', other: 'foo' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
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
    test('for wrong nested rest', () => {
      const input = { other: { key: 'foo' } };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
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
