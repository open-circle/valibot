import { describe, expectTypeOf, test } from 'vitest';
import type { StringIssue, StringSchema } from '../../schemas/index.ts';
import { string } from '../../schemas/index.ts';
import type {
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { SchemaWithCache2Async } from './cache2Async.ts';
import { cache2Async } from './cache2Async.ts';
import type { Cache2 } from './types.ts';

describe('cache2Async', () => {
  describe('should return schema object', () => {
    test('without config', () => {
      const schema = string();
      expectTypeOf(cache2Async(schema)).toEqualTypeOf<
        SchemaWithCache2Async<typeof schema, undefined>
      >();
      expectTypeOf(cache2Async(schema, undefined)).toEqualTypeOf<
        SchemaWithCache2Async<typeof schema, undefined>
      >();
    });

    test('with config', () => {
      const schema = string();
      expectTypeOf(cache2Async(schema, { maxSize: 10 })).toMatchTypeOf<
        SchemaWithCache2Async<typeof schema, { maxSize: 10 }>
      >();
      expectTypeOf<
        SchemaWithCache2Async<typeof schema, { maxSize: 10 }>
      >().toMatchTypeOf(cache2Async(schema, { maxSize: 10 }));
    });
  });
  describe('should infer correct types', () => {
    type Schema = SchemaWithCache2Async<StringSchema<undefined>, undefined>;

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
        Cache2<OutputDataset<string, StringIssue>>
      >();
    });
  });
});
