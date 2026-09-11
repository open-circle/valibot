import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { jsonValue, type JsonValueSchema } from './jsonValue.ts';
import type { JsonValue, JsonValueIssue } from './types.ts';

describe('jsonValue', () => {
  describe('should return schema object', () => {
    test('with undefined message', () => {
      type Schema = JsonValueSchema<undefined>;
      expectTypeOf(jsonValue()).toEqualTypeOf<Schema>();
      expectTypeOf(jsonValue(undefined)).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(jsonValue('message')).toEqualTypeOf<
        JsonValueSchema<'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(jsonValue(() => 'message')).toEqualTypeOf<
        JsonValueSchema<() => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema = JsonValueSchema<undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<JsonValue>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<JsonValue>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<JsonValueIssue>();
    });
  });
});
