import { describe, expect, test } from 'vitest';
import { decimal, email, url } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import { EMAIL_REGEX } from '../../regex.ts';
import type {
  FailureDataset,
  InferIssue,
  InferOutput,
  PartialDataset,
} from '../../types/index.ts';
import { expectNoSchemaIssue } from '../../vitest/index.ts';
import { bigint } from '../bigint/bigint.ts';
import { boolean } from '../boolean/index.ts';
import { enum as enum_ } from '../enum/index.ts';
import { exactOptional } from '../exactOptional/index.ts';
import { literal } from '../literal/literal.ts';
import { null_ } from '../null/null.ts';
import { nullish } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { object } from '../object/index.ts';
import { optional } from '../optional/index.ts';
import { picklist } from '../picklist/index.ts';
import { strictObject } from '../strictObject/index.ts';
import { string } from '../string/index.ts';
import { variant, type VariantSchema } from './variant.ts';

describe('variant', () => {
  describe('should return schema object', () => {
    const key = 'type' as const;
    type Key = typeof key;
    const options = [
      object({ type: literal('foo') }),
      strictObject({ type: literal('bar') }),
    ] as const;
    type Options = typeof options;
    const baseSchema: Omit<VariantSchema<Key, Options, never>, 'message'> = {
      kind: 'schema',
      type: 'variant',
      reference: variant,
      expects: 'Object',
      key,
      options,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: VariantSchema<Key, Options, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(variant(key, options)).toStrictEqual(schema);
      expect(variant(key, options, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(variant(key, options, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies VariantSchema<Key, Options, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(variant(key, options, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies VariantSchema<Key, Options, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for simple variants', () => {
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo') }),
          object({ type: literal('bar') }),
          object({ type: null_() }),
        ]),
        [{ type: 'foo' }, { type: 'bar' }, { type: null }]
      );
    });

    test('for same discriminators', () => {
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo'), other: string() }),
          object({ type: literal('foo'), other: number() }),
          object({ type: literal('foo'), other: boolean() }),
        ]),
        [
          { type: 'foo', other: 'hello' },
          { type: 'foo', other: 123 },
          { type: 'foo', other: true },
        ]
      );
    });

    test('for nested variants', () => {
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo') }),
          variant('type', [
            object({ type: literal('bar') }),
            object({ type: null_() }),
          ]),
        ]),
        [{ type: 'foo' }, { type: 'bar' }, { type: null }]
      );
    });

    test('for deeply nested variants', () => {
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo') }),
          variant('type', [
            object({ type: literal('bar') }),
            variant('type', [object({ type: null_() })]),
          ]),
        ]),
        [{ type: 'foo' }, { type: 'bar' }, { type: null }]
      );
    });

    test('for optional discriminators', () => {
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo') }),
          object({ type: exactOptional(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: 'bar' }]
      );
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo') }),
          object({ type: optional(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: undefined }, { type: 'bar' }]
      );
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal('foo') }),
          object({ type: nullish(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: null }, { type: undefined }, { type: 'bar' }]
      );
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for invalid base type', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      expect(schema['~run']({ value: 'foo' }, {})).toStrictEqual({
        typed: false,
        value: 'foo',
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: 'foo',
            expected: 'Object',
            received: '"foo"',
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for empty options', () => {
      const schema = variant('type', []);
      const input = { type: 'foo' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.type,
            expected: 'never',
            received: `"${input.type}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'type',
                value: input.type,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing discriminator', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      const input = { other: 123 };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: undefined,
            expected: '("foo" | "bar")',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'type',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid discriminator', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      const input = { type: 'baz' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.type,
            expected: '("foo" | "bar")',
            received: `"${input.type}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'type',
                value: input.type,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for nested missing discriminator', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        variant('other', [
          object({ type: literal('bar'), other: string() }),
          object({ type: literal('bar'), other: boolean() }),
          object({ type: literal('baz'), other: number() }),
        ]),
      ]);
      const input = { type: 'bar' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: undefined,
            expected: '(string | boolean)',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for nested invalid discriminator', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        variant('other', [
          object({ type: literal('bar'), other: string() }),
          object({ type: literal('bar'), other: boolean() }),
          object({ type: literal('baz'), other: number() }),
        ]),
      ]);
      const input = { type: 'bar', other: 123 };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.other,
            expected: '(string | boolean)',
            received: `${input.other}`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first missing invalid discriminator', () => {
      const schema = variant('type', [
        variant('subType1', [
          object({
            type: literal('foo'),
            subType1: literal('foo-1'),
            other1: string(),
          }),
          object({
            type: literal('bar'),
            subType1: literal('bar-1'),
            other2: string(),
          }),
        ]),
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foo-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('bar-2'),
            other4: string(),
          }),
        ]),
      ]);
      const input = {};
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: undefined,
            expected: '("foo" | "bar")',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'type',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first nested missing discriminator', () => {
      const schema = variant('type', [
        variant('subType1', [
          object({
            type: literal('foo'),
            subType1: literal('foo-1'),
            other1: string(),
          }),
          object({
            type: literal('bar'),
            subType1: literal('bar-1'),
            other2: string(),
          }),
        ]),
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foo-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('bar-2'),
            other4: string(),
          }),
        ]),
      ]);
      const input = { type: 'bar' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: undefined,
            expected: '"bar-1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'subType1',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first nested invalid discriminator', () => {
      const schema = variant('type', [
        variant('subType1', [
          object({
            type: literal('foo'),
            subType1: literal('foo-1'),
            other1: string(),
          }),
          object({
            type: literal('bar'),
            subType1: literal('bar-1'),
            other2: string(),
          }),
        ]),
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foo-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('bar-2'),
            other4: string(),
          }),
        ]),
      ]);
      const input = { type: 'bar', subType2: 'baz-2' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.subType2,
            expected: '"bar-2"',
            received: `"${input.subType2}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'subType2',
                value: input.subType2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first nested invalid discriminator', () => {
      const schema = variant('type', [
        variant('subType1', [
          object({
            type: literal('foo'),
            subType1: literal('foo-1'),
            other1: string(),
          }),
          object({
            type: literal('bar'),
            subType1: literal('bar-1'),
            other2: string(),
          }),
        ]),
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foo-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('bar-2'),
            other4: string(),
          }),
        ]),
      ]);
      const input = { type: 'bar', subType1: 'invalid', subType2: 'invalid' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.subType1,
            expected: '"bar-1"',
            received: `"${input.subType1}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'subType1',
                value: input.subType1,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first nested invalid discriminator', () => {
      const schema = variant('type', [
        variant('subType1', [
          variant('subType2', [
            object({
              type: literal('foo'),
              subType1: literal('foo-1'),
              subType2: literal('foo-2'),
              other1: string(),
            }),
            object({
              type: literal('bar'),
              subType1: literal('bar-1'),
              subType2: literal('bar-2'),
              other2: string(),
            }),
          ]),
        ]),
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foz-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('baz-2'),
            other4: string(),
          }),
        ]),
      ]);
      const input = { type: 'bar', subType1: 'bar-1', subType2: 'invalid' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.subType2,
            expected: '("bar-2" | "baz-2")',
            received: `"${input.subType2}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'subType2',
                value: input.subType2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first nested invalid discriminator', () => {
      const schema = variant('type', [
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foz-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('baz-2'),
            other4: string(),
          }),
        ]),
        variant('subType1', [
          variant('subType2', [
            object({
              type: literal('foo'),
              subType1: literal('foo-1'),
              subType2: literal('foo-2'),
              other1: string(),
            }),
            object({
              type: literal('bar'),
              subType1: literal('bar-1'),
              subType2: literal('bar-2'),
              other2: string(),
            }),
          ]),
        ]),
      ]);
      const input = { type: 'bar', subType1: 'bar-1', subType2: 'invalid' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.subType2,
            expected: '("baz-2" | "bar-2")',
            received: `"${input.subType2}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'subType2',
                value: input.subType2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for first nested invalid discriminator', () => {
      const schema = variant('type', [
        variant('subType1', [
          object({
            type: literal('foo'),
            subType1: literal('foo-1'),
            other1: string(),
          }),
          object({
            type: literal('bar'),
            subType1: literal('bar-1'),
            other2: string(),
          }),
          variant('subType2', [
            object({
              type: literal('bar'),
              subType1: literal('baz-1'),
              subType2: literal('baz-2'),
              other5: string(),
            }),
          ]),
        ]),
        variant('subType2', [
          object({
            type: literal('foo'),
            subType2: literal('foo-2'),
            other3: string(),
          }),
          object({
            type: literal('bar'),
            subType2: literal('bar-2'),
            other4: string(),
          }),
        ]),
      ]);
      const input = { type: 'bar', subType2: 'baz-2' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: input.subType2,
            expected: '"bar-2"',
            received: `"${input.subType2}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'subType2',
                value: input.subType2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for untyped object', () => {
      const schema = variant('type', [
        object({ type: literal('foo'), other: bigint() }),
        object({ type: literal('bar'), other: string() }),
        object({ type: literal('baz'), other: number() }),
      ]);
      const input = { type: 'bar', other: null };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: input.other,
            expected: 'string',
            received: `${input.other}`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for nested untyped object', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        variant('type', [
          object({ type: literal('bar'), other: string() }),
          object({ type: literal('baz'), other: number() }),
        ]),
      ]);
      const input = { type: 'bar', other: null };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: input.other,
            expected: 'string',
            received: `${input.other}`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for multiple untyped objects', () => {
      const schema = variant('type', [
        object({ type: literal('foo'), other: bigint() }),
        object({ type: literal('bar'), other: string() }),
        object({ type: literal('bar'), other: number() }),
        object({ type: literal('bar'), other: boolean() }),
      ]);
      const input = { type: 'bar', other: null };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: input.other,
            expected: 'string',
            received: `${input.other}`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for typed objects', () => {
      const schema = variant('type', [
        object({ type: literal('foo'), other: number() }),
        object({ type: literal('bar'), other: pipe(string(), email()) }),
        object({ type: literal('baz'), other: boolean() }),
      ]);
      type Schema = typeof schema;
      const input = { type: 'bar', other: 'hello' } as const;
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: true,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'email',
            input: input.other,
            expected: null,
            received: `"${input.other}"`,
            requirement: EMAIL_REGEX,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies PartialDataset<InferOutput<Schema>, InferIssue<Schema>>);
    });

    test('for nested typed objects', () => {
      const schema = variant('type', [
        object({ type: literal('foo'), other: number() }),
        variant('type', [
          object({ type: literal('bar'), other: pipe(string(), email()) }),
          object({ type: literal('baz'), other: boolean() }),
        ]),
      ]);
      type Schema = typeof schema;
      const input = { type: 'bar', other: 'hello' } as const;
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: true,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'email',
            input: input.other,
            expected: null,
            received: `"${input.other}"`,
            requirement: EMAIL_REGEX,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies PartialDataset<InferOutput<Schema>, InferIssue<Schema>>);
    });

    test('for multiple typed objects', () => {
      const schema = variant('type', [
        object({ type: literal('foo'), other: number() }),
        object({ type: literal('foo'), other: pipe(string(), email()) }),
        object({ type: literal('foo'), other: pipe(string(), url()) }),
        object({ type: literal('foo'), other: pipe(string(), decimal()) }),
        object({ type: literal('foo'), other: boolean() }),
      ]);
      type Schema = typeof schema;
      const input = { type: 'foo', other: 'hello' } as const;
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: true,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'email',
            input: input.other,
            expected: null,
            received: `"${input.other}"`,
            requirement: EMAIL_REGEX,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      } satisfies PartialDataset<InferOutput<Schema>, InferIssue<Schema>>);
    });
  });

  describe('should dispatch via discriminator fast path', () => {
    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for literal discriminators', () => {
      const schema = variant('type', [
        object({ type: literal('foo'), value: string() }),
        object({ type: literal('bar'), value: number() }),
      ]);
      expectNoSchemaIssue(schema, [
        { type: 'foo', value: 'hello' },
        { type: 'bar', value: 123 },
      ]);

      // Only the option the discriminator points at is executed, so its own
      // issues are returned instead of those of any other option
      const input = { type: 'bar', value: 'hello' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: input.value,
            expected: 'number',
            received: `"${input.value}"`,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'value',
                value: input.value,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for enum discriminators', () => {
      enum Direction {
        Left = 'left',
        Right = 'right',
      }
      expectNoSchemaIssue(
        variant('type', [
          object({ type: enum_(Direction), value: string() }),
          object({ type: literal('up'), value: number() }),
        ]),
        [
          { type: Direction.Left, value: 'hello' },
          { type: Direction.Right, value: 'hello' },
          { type: 'up', value: 123 },
        ]
      );
    });

    test('for picklist discriminators', () => {
      expectNoSchemaIssue(
        variant('type', [
          object({ type: picklist(['foo', 'foo2']), value: string() }),
          object({ type: literal('bar'), value: number() }),
        ]),
        [
          { type: 'foo', value: 'hello' },
          { type: 'foo2', value: 'hello' },
          { type: 'bar', value: 123 },
        ]
      );
    });

    test('for colliding discriminators', () => {
      // A value claimed by more than one option disables the fast path, so
      // every matching option is tried as before
      expectNoSchemaIssue(
        variant('type', [
          object({ type: picklist(['foo', 'bar']), value: string() }),
          object({ type: literal('bar'), value: number() }),
        ]),
        [
          { type: 'foo', value: 'hello' },
          { type: 'bar', value: 'hello' },
          { type: 'bar', value: 123 },
        ]
      );
    });

    test('for NaN discriminators', () => {
      // `Map` keys use SameValueZero, the same comparison `literal`, `enum`
      // and `picklist` use, so NaN dispatches exactly as it validates
      expectNoSchemaIssue(
        variant('type', [
          object({ type: literal(NaN), value: string() }),
          object({ type: literal('foo'), value: number() }),
        ]),
        [
          { type: NaN, value: 'hello' },
          { type: 'foo', value: 123 },
        ]
      );
      expectNoSchemaIssue(
        variant('type', [object({ type: picklist([NaN, 'foo']) })]),
        [{ type: NaN }, { type: 'foo' }]
      );
    });

    test('for present but undefined discriminator', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      const input = { type: undefined };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'variant',
            input: undefined,
            expected: '("foo" | "bar")',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'type',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for non-enumerable discriminators', () => {
      // Discriminator schemas whose accepted values are not statically known
      // disable the fast path
      expectNoSchemaIssue(
        variant('type', [
          object({ type: string(), value: string() }),
          object({ type: literal('bar'), value: number() }),
        ]),
        [
          { type: 'foo', value: 'hello' },
          { type: 'bar', value: 'hello' },
        ]
      );
    });

    test('without mutating the schema object', () => {
      const schema = variant('type', [
        object({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      const keys = Reflect.ownKeys(schema);
      Object.freeze(schema);
      expect(schema['~run']({ value: { type: 'bar' } }, {})).toStrictEqual({
        typed: true,
        value: { type: 'bar' },
      });
      expect(Reflect.ownKeys(schema)).toStrictEqual(keys);
    });
  });
});
