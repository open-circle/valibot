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
import { optional, type OptionalSchema } from './optional.ts';

describe('optional', () => {
  describe('should return schema object', () => {
    test('with undefined default', () => {
      type Schema = OptionalSchema<StringSchema<undefined>, undefined>;
      expectTypeOf(optional(string())).toEqualTypeOf<Schema>();
      expectTypeOf(optional(string(), undefined)).toEqualTypeOf<Schema>();
    });

    test('with undefined getter default', () => {
      expectTypeOf(optional(string(), () => undefined)).toEqualTypeOf<
        OptionalSchema<StringSchema<undefined>, () => undefined>
      >();
    });

    test('with value default', () => {
      expectTypeOf(optional(string(), 'foo')).toEqualTypeOf<
        OptionalSchema<StringSchema<undefined>, 'foo'>
      >();
    });

    test('with value getter default', () => {
      expectTypeOf(optional(string(), () => 'foo')).toEqualTypeOf<
        OptionalSchema<StringSchema<undefined>, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema1 = OptionalSchema<StringSchema<undefined>, undefined>;
    type Schema2 = OptionalSchema<StringSchema<undefined>, 'foo'>;
    type Schema3 = OptionalSchema<StringSchema<undefined>, () => undefined>;
    type Schema4 = OptionalSchema<StringSchema<undefined>, () => 'foo'>;
    type Schema5 = OptionalSchema<
      SchemaWithPipe<
        [StringSchema<undefined>, TransformAction<string, number>]
      >,
      'foo'
    >;
    type Schema6 = OptionalSchema<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      { foo: string[] }
    >;
    type Schema7 = OptionalSchema<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => { foo: string[] }
    >;

    test('of input', () => {
      type Input = string | undefined;
      expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema3>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema4>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema5>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema6>>().toEqualTypeOf<
        { foo: string[] } | undefined
      >();
      expectTypeOf<InferInput<Schema7>>().toEqualTypeOf<
        { foo: string[] } | undefined
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema3>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema4>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema5>>().toEqualTypeOf<number>();
      expectTypeOf<InferOutput<Schema6>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema7>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema3>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema4>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema5>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema6>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema7>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });
  });
});
