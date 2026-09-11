import { describe, expect, test } from 'vitest';
import {
  boolean,
  nonOptional,
  nullish,
  number,
  object,
  objectWithRest,
  optional,
  string,
} from '../../schemas/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue } from '../../vitest/index.ts';
import { required } from './required.ts';

describe('required', () => {
  const entries = {
    key1: optional(string()),
    key2: optional(number()),
    key3: optional(string()),
    key4: nullish(number(), () => 123),
  };
  const baseInfo = {
    message: expect.any(String),
    requirement: undefined,
    issues: undefined,
    lang: undefined,
    abortEarly: undefined,
    abortPipeEarly: undefined,
  } as const;

  describe('object', () => {
    const wrapped = object(entries);
    const schema1 = required(wrapped);
    const schema2 = required(wrapped, ['key1', 'key3']);

    describe('should return schema object', () => {
      const baseObjectSchema = {
        kind: 'schema',
        type: 'object',
        reference: object,
        expects: 'Object',
        async: false,
        message: undefined,
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
        },
        '~run': expect.any(Function),
      } as const;

      test('with undefined keys and undefined message', () => {
        const expected: typeof schema1 = {
          ...baseObjectSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...nonOptional(entries.key2),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...nonOptional(entries.key4),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
        };
        expect(schema1).toStrictEqual(expected);
        expect(schema1, undefined).toStrictEqual(expected);
      });

      test('with undefined keys and string message', () => {
        const message = 'message';
        const schema = required(wrapped, message);
        expect(schema).toStrictEqual({
          ...baseObjectSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...nonOptional(entries.key2, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...nonOptional(entries.key4, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
        } satisfies typeof schema);
      });

      test('with undefined keys and function message', () => {
        const message = () => 'message';
        const schema = required(wrapped, message);
        expect(schema).toStrictEqual({
          ...baseObjectSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...nonOptional(entries.key2, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...nonOptional(entries.key4, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
        } satisfies typeof schema);
      });

      test('with specific keys and undefined message', () => {
        const expected: typeof schema2 = {
          ...baseObjectSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: entries.key2,
            key3: {
              ...nonOptional(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
        };
        expect(schema2).toStrictEqual(expected);
        expect(schema2, undefined).toStrictEqual(expected);
      });

      test('with specific keys and string message', () => {
        const message = 'message';
        const schema = required(wrapped, ['key1', 'key3'], message);
        expect(schema).toStrictEqual({
          ...baseObjectSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: entries.key2,
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
        } satisfies typeof schema);
      });

      test('with specific keys and function message', () => {
        const message = () => 'message';
        const schema = required(wrapped, ['key1', 'key3'], message);
        expect(schema).toStrictEqual({
          ...baseObjectSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: entries.key2,
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
        } satisfies typeof schema);
      });
    });

    describe('should return dataset without nested issues', () => {
      test('if required keys are present', () => {
        const input1 = { key1: 'foo', key2: 123, key3: 'bar', key4: 123 };
        expectNoSchemaIssue(schema1, [input1]);
        expectNoSchemaIssue(schema2, [input1]);
        const input2 = { key1: 'foo', key3: 'bar' };
        expect(schema2['~run']({ value: input2 }, {})).toStrictEqual({
          typed: true,
          value: { ...input2, key4: 123 },
        });
      });
    });

    describe('should return dataset with nested issues', () => {
      test('if required keys are missing', () => {
        expect(schema1['~run']({ value: {} }, {})).toStrictEqual({
          typed: false,
          value: {},
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'object',
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
              type: 'object',
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
            {
              ...baseInfo,
              kind: 'schema',
              type: 'object',
              input: undefined,
              expected: '"key3"',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input: {},
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'object',
              input: undefined,
              expected: '"key4"',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input: {},
                  key: 'key4',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema1>>);

        const input = { key2: 123, key4: null };
        expect(schema2['~run']({ value: input }, {})).toStrictEqual({
          typed: false,
          value: { ...input, key4: 123 },
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'object',
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
              type: 'object',
              input: undefined,
              expected: '"key3"',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input,
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema2>>);
      });

      test('if required keys are undefined', () => {
        const input1 = {
          key1: undefined,
          key2: undefined,
          key3: undefined,
          key4: undefined,
        };
        expect(schema1['~run']({ value: input1 }, {})).toStrictEqual({
          typed: false,
          value: input1,
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key1',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key2',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key4',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema1>>);

        const input2 = {
          key1: undefined,
          key2: 123,
          key3: undefined,
          key4: null,
        };
        expect(schema2['~run']({ value: input2 }, {})).toStrictEqual({
          typed: false,
          value: { ...input2, key4: 123 },
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input2,
                  key: 'key1',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input2,
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema2>>);
      });
    });

    test('should validate against the required entries via "~standard"', () => {
      expect(schema1['~standard'].validate({})).toMatchObject({
        issues: [
          { path: [{ key: 'key1' }] },
          { path: [{ key: 'key2' }] },
          { path: [{ key: 'key3' }] },
          { path: [{ key: 'key4' }] },
        ],
      });
    });
  });

  describe('objectWithRest', () => {
    const rest = boolean();
    const wrapped = objectWithRest(entries, rest);
    const schema1 = required(wrapped);
    const schema2 = required(wrapped, ['key2', 'key3']);

    describe('should return schema object', () => {
      const baseObjectWithRestSchema = {
        kind: 'schema',
        type: 'object_with_rest',
        reference: objectWithRest,
        expects: 'Object',
        rest,
        message: undefined,
        async: false,
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
        },
        '~run': expect.any(Function),
      } as const;

      test('with undefined keys and undefined message', () => {
        const expected: typeof schema1 = {
          ...baseObjectWithRestSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...nonOptional(entries.key2),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...nonOptional(entries.key4),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
        };
        expect(schema1).toStrictEqual(expected);
        expect(schema1, undefined).toStrictEqual(expected);
      });

      test('with undefined keys and string message', () => {
        const message = 'message';
        const schema = required(wrapped, message);
        expect(schema).toStrictEqual({
          ...baseObjectWithRestSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...nonOptional(entries.key2, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...nonOptional(entries.key4, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
        } satisfies typeof schema);
      });

      test('with undefined keys and function message', () => {
        const message = () => 'message';
        const schema = required(wrapped, message);
        expect(schema).toStrictEqual({
          ...baseObjectWithRestSchema,
          entries: {
            key1: {
              ...nonOptional(entries.key1, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...nonOptional(entries.key2, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...nonOptional(entries.key4, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
        } satisfies typeof schema);
      });

      test('with specific keys and undefined message', () => {
        const expected: typeof schema2 = {
          ...baseObjectWithRestSchema,
          entries: {
            key1: entries.key1,
            key2: {
              ...nonOptional(entries.key2),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
        };
        expect(schema2).toStrictEqual(expected);
        expect(schema2, undefined).toStrictEqual(expected);
      });

      test('with specific keys and string message', () => {
        const message = 'message';
        const schema = required(wrapped, ['key2', 'key3'], message);
        expect(schema).toStrictEqual({
          ...baseObjectWithRestSchema,
          entries: {
            key1: entries.key1,
            key2: {
              ...nonOptional(entries.key2, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
        } satisfies typeof schema);
      });

      test('with specific keys and function message', () => {
        const message = () => 'message';
        const schema = required(wrapped, ['key2', 'key3'], message);
        expect(schema).toStrictEqual({
          ...baseObjectWithRestSchema,
          entries: {
            key1: entries.key1,
            key2: {
              ...nonOptional(entries.key2, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...nonOptional(entries.key3, message),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
        } satisfies typeof schema);
      });
    });

    describe('should return dataset without nested issues', () => {
      test('if required keys are present', () => {
        const input1 = {
          key1: 'foo',
          key2: 123,
          key3: 'bar',
          key4: 123,
          other: true,
        };
        // @ts-expect-error
        expectNoSchemaIssue(schema1, [input1]);
        // @ts-expect-error
        expectNoSchemaIssue(schema2, [input1]);
        const input2 = { key2: 123, key3: 'bar', other: true };
        expect(schema2['~run']({ value: input2 }, {})).toStrictEqual({
          typed: true,
          value: { ...input2, key4: 123 },
        });
      });
    });

    describe('should return dataset with nested issues', () => {
      test('if required keys are missing', () => {
        expect(schema1['~run']({ value: {} }, {})).toStrictEqual({
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
            {
              ...baseInfo,
              kind: 'schema',
              type: 'object_with_rest',
              input: undefined,
              expected: '"key3"',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input: {},
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'object_with_rest',
              input: undefined,
              expected: '"key4"',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input: {},
                  key: 'key4',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema1>>);

        const input = { key1: 'foo', key4: null, other: true };
        expect(schema2['~run']({ value: input }, {})).toStrictEqual({
          typed: false,
          value: { ...input, key4: 123 },
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
              expected: '"key3"',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input,
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema2>>);
      });

      test('if required keys are undefined', () => {
        const input1 = {
          key1: undefined,
          key2: undefined,
          key3: undefined,
          key4: undefined,
        };
        expect(schema1['~run']({ value: input1 }, {})).toStrictEqual({
          typed: false,
          value: input1,
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key1',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key2',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input1,
                  key: 'key4',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema1>>);

        const input2 = {
          key1: 'foo',
          key2: undefined,
          key3: undefined,
          key4: null,
          other: true,
        };
        expect(schema2['~run']({ value: input2 }, {})).toStrictEqual({
          typed: false,
          value: { ...input2, key4: 123 },
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input2,
                  key: 'key2',
                  value: undefined,
                },
              ],
            },
            {
              ...baseInfo,
              kind: 'schema',
              type: 'non_optional',
              input: undefined,
              expected: '!undefined',
              received: 'undefined',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input2,
                  key: 'key3',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema2>>);
      });
    });
  });
});
