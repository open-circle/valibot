import { describe, expectTypeOf, test } from 'vitest';
import type { StringIssue, StringSchema } from '../../schemas/index.ts';
import { string } from '../../schemas/index.ts';
import type {
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { SchemaWithCacheAsync } from './cacheAsync.ts';
import { cacheAsync } from './cacheAsync.ts';
import type { Cache } from './types.ts';

describe('cacheAsync', () => {
  describe('should return schema object', () => {
    test('without config', () => {
      const schema = string();
      expectTypeOf(cacheAsync(schema)).toEqualTypeOf<
        SchemaWithCacheAsync<typeof schema, undefined>
      >();
      expectTypeOf(cacheAsync(schema, undefined)).toEqualTypeOf<
        SchemaWithCacheAsync<typeof schema, undefined>
      >();
    });

    test('with config', () => {
      const schema = string();
      expectTypeOf(cacheAsync(schema, { maxSize: 10 })).toMatchTypeOf<
        SchemaWithCacheAsync<typeof schema, { maxSize: 10 }>
      >();
      expectTypeOf<
        SchemaWithCacheAsync<typeof schema, { maxSize: 10 }>
      >().toMatchTypeOf(cacheAsync(schema, { maxSize: 10 }));
    });
  });
  describe('should infer correct types', () => {
    type Schema = SchemaWithCacheAsync<StringSchema<undefined>, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<StringIssue>();
    });

    test('of cache', () => {
      expectTypeOf<Schema['cache']>().toEqualTypeOf<
        Cache<OutputDataset<string, StringIssue>>
      >();
    });
  });
});
