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
import { exactOptional, type ExactOptionalSchema } from './exactOptional.ts';

describe('exactOptional', () => {
  describe('should return schema object', () => {
    test('with undefined default', () => {
      type Schema = ExactOptionalSchema<StringSchema<undefined>, undefined>;
      expectTypeOf(exactOptional(string())).toEqualTypeOf<Schema>();
      expectTypeOf(exactOptional(string(), undefined)).toEqualTypeOf<Schema>();
    });

    test('with value default', () => {
      expectTypeOf(exactOptional(string(), 'foo')).toEqualTypeOf<
        ExactOptionalSchema<StringSchema<undefined>, 'foo'>
      >();
    });

    test('with value getter default', () => {
      expectTypeOf(exactOptional(string(), () => 'foo')).toEqualTypeOf<
        ExactOptionalSchema<StringSchema<undefined>, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema1 = ExactOptionalSchema<StringSchema<undefined>, undefined>;
    type Schema2 = ExactOptionalSchema<StringSchema<undefined>, 'foo'>;
    type Schema3 = ExactOptionalSchema<StringSchema<undefined>, () => 'foo'>;
    type Schema4 = ExactOptionalSchema<
      SchemaWithPipe<
        [StringSchema<undefined>, TransformAction<string, number>]
      >,
      'foo'
    >;
    type Schema5 = ExactOptionalSchema<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      { foo: string[] }
    >;
    type Schema6 = ExactOptionalSchema<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => { foo: string[] }
    >;

    test('of input', () => {
      expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<string>();
      expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<string>();
      expectTypeOf<InferInput<Schema3>>().toEqualTypeOf<string>();
      expectTypeOf<InferInput<Schema4>>().toEqualTypeOf<string>();
      expectTypeOf<InferInput<Schema5>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferInput<Schema6>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema3>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema4>>().toEqualTypeOf<number>();
      expectTypeOf<InferOutput<Schema5>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema6>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema3>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema4>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema5>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema6>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });
  });
});
