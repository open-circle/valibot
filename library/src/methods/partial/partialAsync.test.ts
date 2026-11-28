import { describe, expect, test } from 'vitest';
import {
  boolean,
  nullishAsync,
  number,
  objectAsync,
  objectWithRestAsync,
  optionalAsync,
  string,
} from '../../schemas/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssueAsync } from '../../vitest/index.ts';
import { partialAsync } from './partialAsync.ts';

describe('partialAsync', () => {
  const entries = {
    key1: string(),
    key2: number(),
    key3: string(),
    key4: nullishAsync(number(), async () => 123),
  };
  const baseInfo = {
    message: expect.any(String),
    requirement: undefined,
    issues: undefined,
    lang: undefined,
    abortEarly: undefined,
    abortPipeEarly: undefined,
  } as const;

  describe('objectAsync', () => {
    const wrapped = objectAsync(entries);
    const schema1 = partialAsync(wrapped);
    const schema2 = partialAsync(wrapped, ['key1', 'key3']);

    describe('should return schema objectAsync', () => {
      test('with undefined keys', () => {
        expect(schema1).toStrictEqual({
          kind: 'schema',
          type: 'object',
          reference: objectAsync,
          expects: 'Object',
          entries: {
            key1: {
              ...optionalAsync(entries.key1),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...optionalAsync(entries.key2),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...optionalAsync(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...optionalAsync(entries.key4),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
          message: undefined,
          async: true,
          '~standard': {
            version: 1,
            vendor: 'valibot',
            validate: expect.any(Function),
          },
          '~run': expect.any(Function),
        } satisfies typeof schema1);
      });

      test('with specific keys', () => {
        expect(schema2).toStrictEqual({
          kind: 'schema',
          type: 'object',
          reference: objectAsync,
          expects: 'Object',
          entries: {
            key1: {
              ...optionalAsync(entries.key1),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: entries.key2,
            key3: {
              ...optionalAsync(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
          message: undefined,
          async: true,
          '~standard': {
            version: 1,
            vendor: 'valibot',
            validate: expect.any(Function),
          },
          '~run': expect.any(Function),
        } satisfies typeof schema2);
      });
    });

    describe('should return dataset without nested issues', () => {
      test('if partialAsync keys are present', async () => {
        const input = { key1: 'foo', key2: 123, key3: 'bar', key4: 123 };
        await expectNoSchemaIssueAsync(schema1, [input]);
        await expectNoSchemaIssueAsync(schema2, [input]);
      });

      test('if partialAsync keys are missing', async () => {
        await expectNoSchemaIssueAsync(schema1, [{}]);
        await expectNoSchemaIssueAsync(schema2, [{ key2: 123, key4: 123 }]);
      });
    });

    describe('should return dataset with nested issues', () => {
      test('if required keys are missing', async () => {
        for (const input of [{}, { key1: 'foo', key3: 'bar' }]) {
          expect(await schema2['~run']({ value: input }, {})).toStrictEqual({
            typed: false,
            value: { ...input, key4: 123 },
            issues: [
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
                    input: input,
                    key: 'key2',
                    value: undefined,
                  },
                ],
              },
            ],
          } satisfies FailureDataset<InferIssue<typeof schema2>>);
        }
      });
    });
  });

  describe('objectWithRestAsync', () => {
    const rest = boolean();
    const wrapped = objectWithRestAsync(entries, rest);
    const schema1 = partialAsync(wrapped);
    const schema2 = partialAsync(wrapped, ['key2', 'key3']);

    describe('should return schema objectAsync', () => {
      test('with undefined keys', () => {
        expect(schema1).toStrictEqual({
          kind: 'schema',
          type: 'object_with_rest',
          reference: objectWithRestAsync,
          expects: 'Object',
          entries: {
            key1: {
              ...optionalAsync(entries.key1),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key2: {
              ...optionalAsync(entries.key2),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...optionalAsync(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: {
              ...optionalAsync(entries.key4),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
          },
          rest,
          message: undefined,
          async: true,
          '~standard': {
            version: 1,
            vendor: 'valibot',
            validate: expect.any(Function),
          },
          '~run': expect.any(Function),
        } satisfies typeof schema1);
      });

      test('with specific keys', () => {
        expect(schema2).toStrictEqual({
          kind: 'schema',
          type: 'object_with_rest',
          reference: objectWithRestAsync,
          expects: 'Object',
          entries: {
            key1: entries.key1,
            key2: {
              ...optionalAsync(entries.key2),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key3: {
              ...optionalAsync(entries.key3),
              '~standard': {
                version: 1,
                vendor: 'valibot',
                validate: expect.any(Function),
              },
              '~run': expect.any(Function),
            },
            key4: entries.key4,
          },
          rest,
          message: undefined,
          async: true,
          '~standard': {
            version: 1,
            vendor: 'valibot',
            validate: expect.any(Function),
          },
          '~run': expect.any(Function),
        } satisfies typeof schema2);
      });
    });

    describe('should return dataset without nested issues', () => {
      test('if partialAsync keys are present', async () => {
        const input = {
          key1: 'foo',
          key2: 123,
          key3: 'bar',
          key4: 123,
          other: true,
        };
        // @ts-expect-error
        await expectNoSchemaIssueAsync(schema1, [input]);
        // @ts-expect-error
        await expectNoSchemaIssueAsync(schema2, [input]);
      });

      test('if partialAsync keys are missing', async () => {
        await expectNoSchemaIssueAsync(schema1, [{}]);
        await expectNoSchemaIssueAsync(schema2, [
          // @ts-expect-error
          { key1: 'foo', key4: 123, other: true },
        ]);
      });
    });

    describe('should return dataset with nested issues', () => {
      test('if required keys are missing', async () => {
        for (const input of [{}, { key2: 123, key3: 'bar', other: true }]) {
          expect(await schema2['~run']({ value: input }, {})).toStrictEqual({
            typed: false,
            value: { ...input, key4: 123 },
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
                    input: input,
                    key: 'key1',
                    value: undefined,
                  },
                ],
              },
            ],
          } satisfies FailureDataset<InferIssue<typeof schema2>>);
        }
      });
    });
  });
});
