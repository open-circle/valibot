import { describe, expect, test } from 'vitest';
import {
  boolean,
  type BooleanIssue,
  number,
  object,
  objectWithRest,
  string,
} from '../../schemas/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue } from '../../vitest/index.ts';
import { omit } from './omit.ts';

describe('omit', () => {
  const entries = {
    key1: string(),
    key2: number(),
    key3: string(),
    key4: number(),
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
    const schema = omit(object(entries), ['key1', 'key3']);

    test('should return schema object', () => {
      expect(schema).toStrictEqual({
        kind: 'schema',
        type: 'object',
        reference: object,
        expects: 'Object',
        entries: {
          key2: {
            ...number(),
            '~standard': {
              version: 1,
              vendor: 'valibot',
              validate: expect.any(Function),
            },
            '~run': expect.any(Function),
          },
          key4: {
            ...number(),
            '~standard': {
              version: 1,
              vendor: 'valibot',
              validate: expect.any(Function),
            },
            '~run': expect.any(Function),
          },
        },
        message: undefined,
        async: false,
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
        },
        '~run': expect.any(Function),
      } satisfies typeof schema);
    });

    describe('should return dataset without nested issues', () => {
      test('if not omitted keys are specified', () => {
        expectNoSchemaIssue(schema, [{ key2: 123, key4: 456 }]);
      });

      test('for unknown entries', () => {
        expect(
          schema['~run'](
            { value: { key1: 'foo', key2: 123, key4: 456, other: null } },
            {}
          )
        ).toStrictEqual({
          typed: true,
          value: { key2: 123, key4: 456 },
        });
      });
    });

    describe('should return dataset with nested issues', () => {
      test('if a not omitted key is missing', () => {
        expect(schema['~run']({ value: { key2: 123 } }, {})).toStrictEqual({
          typed: false,
          value: { key2: 123 },
          issues: [
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
                  input: { key2: 123 },
                  key: 'key4',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema>>);
      });
    });

    test('should validate against the omitted entries via "~standard"', () => {
      expect(
        schema['~standard'].validate({ key2: 123, key4: 456 })
      ).toMatchObject({ value: { key2: 123, key4: 456 } });
      expect(
        schema['~standard'].validate({ key1: 'foo', key2: 123, key4: 456 })
      ).toMatchObject({ value: { key2: 123, key4: 456 } });
    });
  });

  describe('objectWithRest', () => {
    const schema = omit(objectWithRest(entries, boolean()), ['key2', 'key3']);

    test('should return schema object', () => {
      expect(schema).toStrictEqual({
        kind: 'schema',
        type: 'object_with_rest',
        reference: objectWithRest,
        expects: 'Object',
        entries: {
          key1: {
            ...string(),
            '~standard': {
              version: 1,
              vendor: 'valibot',
              validate: expect.any(Function),
            },
            '~run': expect.any(Function),
          },
          key4: {
            ...number(),
            '~standard': {
              version: 1,
              vendor: 'valibot',
              validate: expect.any(Function),
            },
            '~run': expect.any(Function),
          },
        },
        rest: {
          ...boolean(),
          '~standard': {
            version: 1,
            vendor: 'valibot',
            validate: expect.any(Function),
          },
          '~run': expect.any(Function),
        },
        message: undefined,
        async: false,
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
        },
        '~run': expect.any(Function),
      } satisfies typeof schema);
    });

    describe('should return dataset without nested issues', () => {
      test('if not omitted keys are specified', () => {
        // @ts-expect-error
        expectNoSchemaIssue(schema, [{ key1: 'foo', key4: 456 }]);
      });

      test('if omitted key matches rest', () => {
        // @ts-expect-error
        expectNoSchemaIssue(schema, [{ key1: 'foo', key2: true, key4: 456 }]);
      });
    });

    describe('should return dataset with nested issues', () => {
      test('if a not omitted key is missing', () => {
        expect(schema['~run']({ value: { key1: 'foo' } }, {})).toStrictEqual({
          typed: false,
          value: { key1: 'foo' },
          issues: [
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
                  input: { key1: 'foo' },
                  key: 'key4',
                  value: undefined,
                },
              ],
            },
          ],
        } satisfies FailureDataset<InferIssue<typeof schema>>);
      });

      test('if an omitted key does not match rest', () => {
        expect(
          schema['~run']({ value: { key1: 'foo', key2: null, key4: 456 } }, {})
        ).toStrictEqual({
          typed: false,
          value: { key1: 'foo', key2: null, key4: 456 },
          issues: [
            {
              ...baseInfo,
              kind: 'schema',
              type: 'boolean',
              input: null,
              expected: 'boolean',
              received: 'null',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: { key1: 'foo', key2: null, key4: 456 },
                  key: 'key2',
                  value: null,
                },
              ],
            } satisfies BooleanIssue,
          ],
        } satisfies FailureDataset<InferIssue<typeof schema>>);
      });
    });
  });
});
