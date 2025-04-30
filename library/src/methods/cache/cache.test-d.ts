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
import type { SchemaWithCache } from './cache.ts';
import { cache } from './cache.ts';

describe('cache', () => {
  describe('should return schema object', () => {
    test('without options', () => {
      const schema = string();
      expectTypeOf(cache(schema)).toEqualTypeOf<
        SchemaWithCache<typeof schema, undefined>
      >();
      expectTypeOf(cache(schema, undefined)).toEqualTypeOf<
        SchemaWithCache<typeof schema, undefined>
      >();
    });
    test('with options', () => {
      const schema = string();
      expectTypeOf(cache(schema, { maxSize: 10 })).toEqualTypeOf<
        SchemaWithCache<typeof schema, { maxSize: 10 }>
      >();
    });
    test('with cache instance', () => {
      const schema = string();

      class CustomCache<TKey, TValue>
        extends Map<TKey, TValue>
        implements BaseCache<TKey, TValue> {}

      expectTypeOf(cache(schema, { cache: new CustomCache() })).toEqualTypeOf<
        SchemaWithCache<
          typeof schema,
          { cache: CustomCache<unknown, OutputDataset<string, StringIssue>> }
        >
      >();
    });
  });
  describe('should infer correct types', () => {
    type Schema = SchemaWithCache<StringSchema<undefined>, undefined>;
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
