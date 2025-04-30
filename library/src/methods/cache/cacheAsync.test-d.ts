import { describe, expectTypeOf, test } from 'vitest';
import type { StringIssue, StringSchema } from '../../schemas/index.ts';
import { string } from '../../schemas/index.ts';
import type {
  BaseCache,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { _Cache } from '../../utils/index.ts';
import type { SchemaWithCacheAsync } from './cacheAsync.ts';
import { cacheAsync } from './cacheAsync.ts';

describe('cacheAsync', () => {
  describe('should return schema object', () => {
    test('without options', () => {
      const schema = string();
      expectTypeOf(cacheAsync(schema)).toEqualTypeOf<
        SchemaWithCacheAsync<typeof schema, undefined>
      >();
      expectTypeOf(cacheAsync(schema, undefined)).toEqualTypeOf<
        SchemaWithCacheAsync<typeof schema, undefined>
      >();
    });
    test('with options', () => {
      const schema = string();
      expectTypeOf(cacheAsync(schema, { maxSize: 10 })).toEqualTypeOf<
        SchemaWithCacheAsync<typeof schema, { maxSize: 10 }>
      >();
    });
    test('with cache instance', () => {
      const schema = string();

      class CustomCache<TKey, TValue>
        extends Map<TKey, TValue>
        implements BaseCache<TKey, TValue> {}

      expectTypeOf(
        cacheAsync(schema, { cache: new CustomCache() })
      ).toEqualTypeOf<
        SchemaWithCacheAsync<
          typeof schema,
          { cache: CustomCache<unknown, OutputDataset<string, StringIssue>> }
        >
      >();
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
        _Cache<unknown, OutputDataset<string, StringIssue>>
      >();
    });
  });
});
