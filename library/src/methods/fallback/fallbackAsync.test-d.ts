import { describe, expectTypeOf, test } from 'vitest';
import { transform, type TransformAction } from '../../actions/index.ts';
import type { ArrayIssue, ArraySchema } from '../../schemas/array/index.ts';
import {
  number,
  type NumberIssue,
  type NumberSchema,
} from '../../schemas/index.ts';
import type { ObjectIssue, ObjectSchema } from '../../schemas/object/index.ts';
import type { StringIssue, StringSchema } from '../../schemas/string/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import type { InferFallback } from '../getFallback/index.ts';
import { pipe, type SchemaWithPipe } from '../pipe/index.ts';
import {
  fallbackAsync,
  type SchemaWithFallbackAsync,
} from './fallbackAsync.ts';

describe('fallbackAsync', () => {
  describe('should return schema object', () => {
    const schema = pipe(number(), transform(String));
    type Schema = typeof schema;

    test('with value fallback', () => {
      expectTypeOf(fallbackAsync(schema, '123' as const)).toEqualTypeOf<
        SchemaWithFallbackAsync<Schema, '123'>
      >();
    });

    test('with function fallback', () => {
      expectTypeOf(fallbackAsync(schema, () => '123' as const)).toEqualTypeOf<
        SchemaWithFallbackAsync<Schema, () => '123'>
      >();
    });

    test('with async function fallback', () => {
      expectTypeOf(
        fallbackAsync(schema, async () => '123' as const)
      ).toEqualTypeOf<SchemaWithFallbackAsync<Schema, () => Promise<'123'>>>();
    });
  });

  describe('should infer correct types', () => {
    type Schema1 = SchemaWithFallbackAsync<
      SchemaWithPipe<
        [NumberSchema<undefined>, TransformAction<number, string>]
      >,
      () => Promise<'123'>
    >;
    type Schema2 = SchemaWithFallbackAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      { readonly foo: readonly string[] }
    >;
    type Schema3 = SchemaWithFallbackAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => { readonly foo: readonly string[] }
    >;
    type Schema4 = SchemaWithFallbackAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => Promise<{ readonly foo: readonly string[] }>
    >;

    test('of input', () => {
      expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<number>();
      expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferInput<Schema3>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferInput<Schema4>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema3>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema4>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<NumberIssue>();
      expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema3>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema4>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });

    test('of fallback', () => {
      expectTypeOf<InferFallback<Schema1>>().toEqualTypeOf<Promise<'123'>>();
      expectTypeOf<InferFallback<Schema2>>().toEqualTypeOf<{
        readonly foo: readonly string[];
      }>();
      expectTypeOf<InferFallback<Schema3>>().toEqualTypeOf<{
        readonly foo: readonly string[];
      }>();
      expectTypeOf<InferFallback<Schema4>>().toEqualTypeOf<
        Promise<{ readonly foo: readonly string[] }>
      >();
    });
  });
});
