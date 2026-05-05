import { describe, expectTypeOf, test } from 'vitest';
import type { TransformAction } from '../../actions/index.ts';
import type { SchemaWithPipe } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import type { ArrayIssue, ArraySchema } from '../array/index.ts';
import type { ObjectIssue, ObjectSchema } from '../object/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import { nullable, type NullableSchema } from './nullable.ts';

describe('nullable', () => {
  describe('should return schema object', () => {
    test('with undefined default', () => {
      type Schema = NullableSchema<StringSchema<undefined>, undefined>;
      expectTypeOf(nullable(string())).toEqualTypeOf<Schema>();
      expectTypeOf(nullable(string(), undefined)).toEqualTypeOf<Schema>();
    });

    test('with null default', () => {
      expectTypeOf(nullable(string(), null)).toEqualTypeOf<
        NullableSchema<StringSchema<undefined>, null>
      >();
    });

    test('with null getter default', () => {
      expectTypeOf(nullable(string(), () => null)).toEqualTypeOf<
        NullableSchema<StringSchema<undefined>, () => null>
      >();
    });

    test('with value default', () => {
      expectTypeOf(nullable(string(), 'foo')).toEqualTypeOf<
        NullableSchema<StringSchema<undefined>, 'foo'>
      >();
    });

    test('with value getter default', () => {
      expectTypeOf(nullable(string(), () => 'foo')).toEqualTypeOf<
        NullableSchema<StringSchema<undefined>, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema1 = NullableSchema<StringSchema<undefined>, undefined>;
    type Schema2 = NullableSchema<StringSchema<undefined>, null>;
    type Schema3 = NullableSchema<StringSchema<undefined>, 'foo'>;
    type Schema4 = NullableSchema<StringSchema<undefined>, () => null>;
    type Schema5 = NullableSchema<StringSchema<undefined>, () => 'foo'>;
    type Schema6 = NullableSchema<
      SchemaWithPipe<
        [StringSchema<undefined>, TransformAction<string, number>]
      >,
      'foo'
    >;
    type Schema7 = NullableSchema<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      { foo: string[] }
    >;
    type Schema8 = NullableSchema<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => { foo: string[] }
    >;

    test('of input', () => {
      type Input = string | null;
      expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema3>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema4>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema5>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema6>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema7>>().toEqualTypeOf<{
        foo: string[];
      } | null>();
      expectTypeOf<InferInput<Schema8>>().toEqualTypeOf<{
        foo: string[];
      } | null>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<string | null>();
      expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<string | null>();
      expectTypeOf<InferOutput<Schema3>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema4>>().toEqualTypeOf<string | null>();
      expectTypeOf<InferOutput<Schema5>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema6>>().toEqualTypeOf<number>();
      expectTypeOf<InferOutput<Schema7>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema8>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema3>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema4>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema5>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema6>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema7>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema8>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });
  });
});
