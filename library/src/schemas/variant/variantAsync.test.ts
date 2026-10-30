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
import { expectNoSchemaIssueAsync } from '../../vitest/index.ts';
import { bigint } from '../bigint/bigint.ts';
import { boolean } from '../boolean/index.ts';
import { enum as enum_ } from '../enum/index.ts';
import { exactOptional, exactOptionalAsync } from '../exactOptional/index.ts';
import { literal } from '../literal/literal.ts';
import { null_ } from '../null/null.ts';
import { nullish, nullishAsync } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { object, objectAsync } from '../object/index.ts';
import { optional, optionalAsync } from '../optional/index.ts';
import { picklist } from '../picklist/index.ts';
import { strictObjectAsync } from '../strictObject/index.ts';
import { string } from '../string/index.ts';
import { variant } from './variant.ts';
import { variantAsync, type VariantSchemaAsync } from './variantAsync.ts';

describe('variantAsync', () => {
  describe('should return schema object', () => {
    const key = 'type' as const;
    type Key = typeof key;
    const options = [
      object({ type: literal('foo') }),
      strictObjectAsync({ type: literal('bar') }),
    ] as const;
    type Options = typeof options;
    const baseSchema: Omit<
      VariantSchemaAsync<Key, Options, never>,
      'message'
    > = {
      kind: 'schema',
      type: 'variant',
      reference: variantAsync,
      expects: 'Object',
      key,
      options,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: VariantSchemaAsync<Key, Options, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(variantAsync(key, options)).toStrictEqual(schema);
      expect(variantAsync(key, options, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(variantAsync(key, options, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies VariantSchemaAsync<Key, Options, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(variantAsync(key, options, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies VariantSchemaAsync<Key, Options, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for simple variants', async () => {
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          object({ type: literal('bar') }),
          objectAsync({ type: null_() }),
        ]),
        [{ type: 'foo' }, { type: 'bar' }, { type: null }]
      );
    });

    test('for same discriminators', async () => {
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo'), other: string() }),
          object({ type: literal('foo'), other: number() }),
          objectAsync({ type: literal('foo'), other: boolean() }),
        ]),
        [
          { type: 'foo', other: 'hello' },
          { type: 'foo', other: 123 },
          { type: 'foo', other: true },
        ]
      );
    });

    test('for nested variants', async () => {
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          variantAsync('type', [
            object({ type: literal('bar') }),
            objectAsync({ type: null_() }),
          ]),
        ]),
        [{ type: 'foo' }, { type: 'bar' }, { type: null }]
      );
    });

    test('for deeply nested variants', async () => {
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          variantAsync('type', [
            object({ type: literal('bar') }),
            variantAsync('type', [object({ type: null_() })]),
          ]),
        ]),
        [{ type: 'foo' }, { type: 'bar' }, { type: null }]
      );
    });

    test('for optional discriminators', async () => {
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          object({ type: exactOptional(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: 'bar' }]
      );
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          objectAsync({ type: exactOptionalAsync(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: 'bar' }]
      );
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          object({ type: optional(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: undefined }, { type: 'bar' }]
      );
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          objectAsync({ type: optionalAsync(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: undefined }, { type: 'bar' }]
      );
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          object({ type: nullish(literal('bar')) }),
          object({ type: literal('baz') }),
        ]),
        [{}, { type: null }, { type: undefined }, { type: 'bar' }]
      );
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          object({ type: literal('foo') }),
          objectAsync({ type: nullishAsync(literal('bar')) }),
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

    test('for invalid base type', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo') }),
        objectAsync({ type: literal('bar') }),
      ]);
      expect(await schema['~run']({ value: 'foo' }, {})).toStrictEqual({
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

    test('for empty options', async () => {
      const schema = variantAsync('type', []);
      const input = { type: 'foo' };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for missing discriminator', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo') }),
        objectAsync({ type: literal('bar') }),
      ]);
      const input = { other: 123 };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for invalid discriminator', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo') }),
        objectAsync({ type: literal('bar') }),
      ]);
      const input = { type: 'baz' };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for nested missing discriminator', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo') }),
        variantAsync('other', [
          object({ type: literal('bar'), other: string() }),
          object({ type: literal('bar'), other: boolean() }),
          object({ type: literal('baz'), other: number() }),
        ]),
      ]);
      const input = { type: 'bar' };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for nested invalid discriminator', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo') }),
        variantAsync('other', [
          object({ type: literal('bar'), other: string() }),
          object({ type: literal('bar'), other: boolean() }),
          object({ type: literal('baz'), other: number() }),
        ]),
      ]);
      const input = { type: 'bar', other: 123 };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first missing invalid discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType1', [
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
        variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first nested missing discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType1', [
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
        variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first nested invalid discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType1', [
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
        variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first nested invalid discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType1', [
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
        variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first nested invalid discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType1', [
          variantAsync('subType2', [
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
        variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first nested invalid discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType2', [
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
        variantAsync('subType1', [
          variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for first nested invalid discriminator', async () => {
      const schema = variantAsync('type', [
        variantAsync('subType1', [
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
          variantAsync('subType2', [
            object({
              type: literal('bar'),
              subType1: literal('baz-1'),
              subType2: literal('baz-2'),
              other5: string(),
            }),
          ]),
        ]),
        variantAsync('subType2', [
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
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for untyped object', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo'), other: bigint() }),
        object({ type: literal('bar'), other: string() }),
        objectAsync({ type: literal('baz'), other: number() }),
      ]);
      const input = { type: 'bar', other: null };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for nested untyped object', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo') }),
        variantAsync('type', [
          object({ type: literal('bar'), other: string() }),
          objectAsync({ type: literal('baz'), other: number() }),
        ]),
      ]);
      const input = { type: 'bar', other: null };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for multiple untyped objects', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo'), other: bigint() }),
        object({ type: literal('bar'), other: string() }),
        object({ type: literal('bar'), other: number() }),
        objectAsync({ type: literal('bar'), other: boolean() }),
      ]);
      const input = { type: 'bar', other: null };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for typed objects', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo'), other: number() }),
        object({ type: literal('bar'), other: pipe(string(), email()) }),
        objectAsync({ type: literal('baz'), other: boolean() }),
      ]);
      type Schema = typeof schema;
      const input = { type: 'bar', other: 'hello' } as const;
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for nested typed objects', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo'), other: number() }),
        variantAsync('type', [
          object({ type: literal('bar'), other: pipe(string(), email()) }),
          objectAsync({ type: literal('baz'), other: boolean() }),
        ]),
      ]);
      type Schema = typeof schema;
      const input = { type: 'bar', other: 'hello' } as const;
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for multiple typed objects', async () => {
      const schema = variantAsync('type', [
        object({ type: literal('foo'), other: number() }),
        object({ type: literal('foo'), other: pipe(string(), email()) }),
        object({ type: literal('foo'), other: pipe(string(), url()) }),
        object({ type: literal('foo'), other: pipe(string(), decimal()) }),
        objectAsync({ type: literal('foo'), other: boolean() }),
      ]);
      type Schema = typeof schema;
      const input = { type: 'foo', other: 'hello' } as const;
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for literal discriminators', async () => {
      const schema = variantAsync('type', [
        objectAsync({ type: literal('foo'), value: string() }),
        object({ type: literal('bar'), value: number() }),
      ]);
      await expectNoSchemaIssueAsync(schema, [
        { type: 'foo', value: 'hello' },
        { type: 'bar', value: 123 },
      ]);

      // Only the option the discriminator points at is executed, so its own
      // issues are returned instead of those of any other option
      const input = { type: 'bar', value: 'hello' };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for enum discriminators', async () => {
      enum Direction {
        Left = 'left',
        Right = 'right',
      }
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          objectAsync({ type: enum_(Direction), value: string() }),
          object({ type: literal('up'), value: number() }),
        ]),
        [
          { type: Direction.Left, value: 'hello' },
          { type: Direction.Right, value: 'hello' },
          { type: 'up', value: 123 },
        ]
      );
    });

    test('for picklist discriminators', async () => {
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          objectAsync({ type: picklist(['foo', 'foo2']), value: string() }),
          object({ type: literal('bar'), value: number() }),
        ]),
        [
          { type: 'foo', value: 'hello' },
          { type: 'foo2', value: 'hello' },
          { type: 'bar', value: 123 },
        ]
      );
    });

    test('for colliding discriminators', async () => {
      // A value claimed by more than one option disables the fast path, so
      // every matching option is tried as before
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          objectAsync({ type: picklist(['foo', 'bar']), value: string() }),
          object({ type: literal('bar'), value: number() }),
        ]),
        [
          { type: 'foo', value: 'hello' },
          { type: 'bar', value: 'hello' },
          { type: 'bar', value: 123 },
        ]
      );
    });

    test('for NaN discriminators', async () => {
      // `Map` keys use SameValueZero, the same comparison `literal`, `enum`
      // and `picklist` use, so NaN dispatches exactly as it validates
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          objectAsync({ type: literal(NaN), value: string() }),
          object({ type: literal('foo'), value: number() }),
        ]),
        [
          { type: NaN, value: 'hello' },
          { type: 'foo', value: 123 },
        ]
      );
      await expectNoSchemaIssueAsync(
        variantAsync('type', [objectAsync({ type: picklist([NaN, 'foo']) })]),
        [{ type: NaN }, { type: 'foo' }]
      );
    });

    test('for present but undefined discriminator', async () => {
      const schema = variantAsync('type', [
        objectAsync({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      const input = { type: undefined };
      expect(await schema['~run']({ value: input }, {})).toStrictEqual({
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

    test('for non-enumerable discriminators', async () => {
      // Discriminator schemas whose accepted values are not statically known
      // disable the fast path
      await expectNoSchemaIssueAsync(
        variantAsync('type', [
          objectAsync({ type: string(), value: string() }),
          object({ type: literal('bar'), value: number() }),
        ]),
        [
          { type: 'foo', value: 'hello' },
          { type: 'bar', value: 'hello' },
        ]
      );
    });

    test('without mutating the schema object', async () => {
      const schema = variantAsync('type', [
        objectAsync({ type: literal('foo') }),
        object({ type: literal('bar') }),
      ]);
      const keys = Reflect.ownKeys(schema);
      Object.freeze(schema);
      expect(
        await schema['~run']({ value: { type: 'bar' } }, {})
      ).toStrictEqual({ typed: true, value: { type: 'bar' } });
      expect(Reflect.ownKeys(schema)).toStrictEqual(keys);
    });

    test('with the same results as the sync schema', async () => {
      const options = [
        object({ type: literal('foo'), value: string() }),
        object({ type: literal('bar'), value: number() }),
        object({ type: picklist(['baz', 'qux']), value: boolean() }),
      ] as const;
      const syncSchema = variant('type', options);
      const asyncSchema = variantAsync('type', options);
      const inputs: unknown[] = [
        { type: 'foo', value: 'hello' },
        { type: 'bar', value: 123 },
        { type: 'baz', value: true },
        { type: 'qux', value: false },
        { type: 'bar', value: 'hello' },
        { type: 'other', value: 123 },
        { type: undefined },
        {},
        'foo',
        null,
      ];
      for (const input of inputs) {
        expect(await asyncSchema['~run']({ value: input }, {})).toStrictEqual(
          syncSchema['~run']({ value: input }, {})
        );
      }
    });
  });
});
