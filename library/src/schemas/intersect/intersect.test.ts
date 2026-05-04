import { describe, expect, test } from 'vitest';
import {
  minLength,
  minValue,
  readonly,
  transform,
} from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import type {
  FailureDataset,
  InferIssue,
  InferOutput,
  PartialDataset,
} from '../../types/index.ts';
import { expectNoSchemaIssue } from '../../vitest/index.ts';
import { array } from '../array/array.ts';
import { date } from '../date/index.ts';
import { number } from '../number/index.ts';
import { object } from '../object/index.ts';
import { string } from '../string/index.ts';
import { intersect, type IntersectSchema } from './intersect.ts';

describe('intersect', () => {
  describe('should return schema object', () => {
    const options = [
      object({ key1: string() }),
      object({ key2: number() }),
    ] as const;
    type Options = typeof options;
    const baseSchema: Omit<IntersectSchema<Options, never>, 'message'> = {
      kind: 'schema',
      type: 'intersect',
      reference: intersect,
      expects: 'Object',
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
      const schema: IntersectSchema<Options, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(intersect(options)).toStrictEqual(schema);
      expect(intersect(options, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(intersect(options, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies IntersectSchema<Options, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(intersect(options, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies IntersectSchema<Options, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for valid values', () => {
      expectNoSchemaIssue(
        intersect([
          array(object({ key1: string(), key2: number() })),
          array(object({ key3: date(), key4: array(string()) })),
        ]),
        [
          [
            { key1: 'foo', key2: 123, key3: new Date(), key4: ['foo', 'bar'] },
            { key1: 'bar', key2: -456, key3: new Date(), key4: ['baz'] },
          ],
        ]
      );
    });

    test('for frozen values', () => {
      expectNoSchemaIssue(
        intersect([
          pipe(
            object({
              key1: string(),
            }),
            readonly(),
            transform((value) => Object.freeze({ ...value }))
          ),
          object({
            key2: number(),
          }),
        ]),
        [{ key1: 'foo', key2: 123 }]
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

    test('for empty options', () => {
      const schema = intersect([]);
      const input = 'foo';
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'intersect',
            input,
            expected: 'never',
            received: `"${input}"`,
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('with untyped output', () => {
      const schema = intersect([string(), number()]);
      const input = 'foo';
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input,
            expected: 'number',
            received: `"${input}"`,
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('with typed output', () => {
      const schema = intersect([
        object({ key1: pipe(string(), minLength(10)) }),
        object({ key2: pipe(number(), minValue(100)) }),
      ]);
      type Schema = typeof schema;
      const input = { key1: 'foo', key2: -123 };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: true,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'min_length',
            input: input.key1,
            expected: '>=10',
            received: '3',
            requirement: 10,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key1',
                value: input.key1,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'validation',
            type: 'min_value',
            input: input.key2,
            expected: '>=100',
            received: '-123',
            requirement: 100,
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
        ],
      } satisfies PartialDataset<InferOutput<Schema>, InferIssue<Schema>>);
    });

    test('with abort early', () => {
      const schema = intersect([
        object({ key1: pipe(string(), minLength(10)) }),
        object({ key2: pipe(number(), minValue(100)) }),
      ]);
      const input = { key1: 'foo', key2: -123 };
      expect(
        schema['~run']({ value: input }, { abortEarly: true })
      ).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            abortEarly: true,
            kind: 'validation',
            type: 'min_length',
            input: input.key1,
            expected: '>=10',
            received: '3',
            requirement: 10,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key1',
                value: input.key1,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for merge error', () => {
      const schema = intersect([
        object({ key: string() }),
        object({
          key: pipe(
            string(),
            transform((input) => input.length)
          ),
        }),
      ]);
      const input = { key: 'foo' };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'intersect',
            input: input,
            expected: 'Object',
            received: 'unknown',
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });
});
