import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { pojo, type PojoIssue, type PojoSchema } from './pojo.ts';

describe('pojo', () => {
  describe('should return schema object', () => {
    test('with undefined message', () => {
      type Schema = PojoSchema<undefined>;
      expectTypeOf(pojo()).toEqualTypeOf<Schema>();
      expectTypeOf(pojo(undefined)).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(pojo('message')).toEqualTypeOf<PojoSchema<'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(pojo(() => 'message')).toEqualTypeOf<
        PojoSchema<() => string>
      >();
    });
  });
  describe('should infer correct types', () => {
    type Schema = PojoSchema<undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
        Record<string, unknown>
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
        Record<string, unknown>
      >();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<PojoIssue>();
    });
  });
});
