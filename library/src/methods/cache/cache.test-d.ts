import { describe, expectTypeOf, test } from 'vitest';
import type { StringIssue, StringSchema } from '../../schemas/index.ts';
import { string } from '../../schemas/index.ts';
import type {
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { SchemaWithCache } from './cache.ts';
import { cache } from './cache.ts';
import type { Cache } from './types.ts';

describe('cache', () => {
  describe('should return schema object', () => {
    test('without config', () => {
      const schema = string();
      expectTypeOf(cache(schema)).toEqualTypeOf<
        SchemaWithCache<typeof schema, undefined>
      >();
      expectTypeOf(cache(schema, undefined)).toEqualTypeOf<
        SchemaWithCache<typeof schema, undefined>
      >();
    });

    test('with config', () => {
      const schema = string();
      expectTypeOf(cache(schema, { maxSize: 10 })).toMatchTypeOf<
        SchemaWithCache<typeof schema, { maxSize: 10 }>
      >();
      expectTypeOf<
        SchemaWithCache<typeof schema, { maxSize: 10 }>
      >().toMatchTypeOf(cache(schema, { maxSize: 10 }));
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
        Cache<OutputDataset<string, StringIssue>>
      >();
    });
  });
});
