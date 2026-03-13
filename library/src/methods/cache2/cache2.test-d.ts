import { describe, expectTypeOf, test } from 'vitest';
import type { StringIssue, StringSchema } from '../../schemas/index.ts';
import { string } from '../../schemas/index.ts';
import type {
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import type { SchemaWithCache2 } from './cache2.ts';
import { cache2 } from './cache2.ts';
import type { Cache2 } from './types.ts';

describe('cache2', () => {
  describe('should return schema object', () => {
    test('without config', () => {
      const schema = string();
      expectTypeOf(cache2(schema)).toEqualTypeOf<
        SchemaWithCache2<typeof schema, undefined>
      >();
      expectTypeOf(cache2(schema, undefined)).toEqualTypeOf<
        SchemaWithCache2<typeof schema, undefined>
      >();
    });

    test('with config', () => {
      const schema = string();
      expectTypeOf(cache2(schema, { maxSize: 10 })).toMatchTypeOf<
        SchemaWithCache2<typeof schema, { maxSize: 10 }>
      >();
      expectTypeOf<
        SchemaWithCache2<typeof schema, { maxSize: 10 }>
      >().toMatchTypeOf(cache2(schema, { maxSize: 10 }));
    });
  });

  describe('should infer correct types', () => {
    type Schema = SchemaWithCache2<StringSchema<undefined>, undefined>;

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
