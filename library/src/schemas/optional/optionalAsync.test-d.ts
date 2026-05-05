import { describe, expectTypeOf, test } from 'vitest';
import type { TransformActionAsync } from '../../actions/index.ts';
import type { SchemaWithPipeAsync } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import type { ArrayIssue, ArraySchema } from '../array/index.ts';
import type { ObjectIssue, ObjectSchema } from '../object/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import { optionalAsync, type OptionalSchemaAsync } from './optionalAsync.ts';

describe('optionalAsync', () => {
  describe('should return schema object', () => {
    test('with undefined default', () => {
      type Schema = OptionalSchemaAsync<StringSchema<undefined>, undefined>;
      expectTypeOf(optionalAsync(string())).toEqualTypeOf<Schema>();
      expectTypeOf(optionalAsync(string(), undefined)).toEqualTypeOf<Schema>();
    });

    test('with undefined getter default', () => {
      expectTypeOf(optionalAsync(string(), () => undefined)).toEqualTypeOf<
        OptionalSchemaAsync<StringSchema<undefined>, () => undefined>
      >();
    });

    test('with async undefined getter default', () => {
      expectTypeOf(
        optionalAsync(string(), async () => undefined)
      ).toEqualTypeOf<
        OptionalSchemaAsync<StringSchema<undefined>, () => Promise<undefined>>
      >();
    });

    test('with value default', () => {
      expectTypeOf(optionalAsync(string(), 'foo')).toEqualTypeOf<
        OptionalSchemaAsync<StringSchema<undefined>, 'foo'>
      >();
    });

    test('with value getter default', () => {
      expectTypeOf(optionalAsync(string(), () => 'foo')).toEqualTypeOf<
        OptionalSchemaAsync<StringSchema<undefined>, () => string>
      >();
    });

    test('with async value getter default', () => {
      expectTypeOf(optionalAsync(string(), async () => 'foo')).toEqualTypeOf<
        OptionalSchemaAsync<StringSchema<undefined>, () => Promise<string>>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema1 = OptionalSchemaAsync<StringSchema<undefined>, undefined>;
    type Schema2 = OptionalSchemaAsync<StringSchema<undefined>, 'foo'>;
    type Schema3 = OptionalSchemaAsync<
      StringSchema<undefined>,
      () => undefined
    >;
    type Schema4 = OptionalSchemaAsync<StringSchema<undefined>, () => 'foo'>;
    type Schema5 = OptionalSchemaAsync<
      StringSchema<undefined>,
      () => Promise<undefined>
    >;
    type Schema6 = OptionalSchemaAsync<
      StringSchema<undefined>,
      () => Promise<'foo'>
    >;
    type Schema7 = OptionalSchemaAsync<
      SchemaWithPipeAsync<
        [StringSchema<undefined>, TransformActionAsync<string, number>]
      >,
      'foo'
    >;
    type Schema8 = OptionalSchemaAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      { foo: string[] }
    >;
    type Schema9 = OptionalSchemaAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => { foo: string[] }
    >;
    type Schema10 = OptionalSchemaAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => Promise<{ foo: string[] }>
    >;

    test('of input', () => {
      type Input = string | undefined;
      expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema3>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema4>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema5>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema6>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema7>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema8>>().toEqualTypeOf<
        { foo: string[] } | undefined
      >();
      expectTypeOf<InferInput<Schema9>>().toEqualTypeOf<
        { foo: string[] } | undefined
      >();
      expectTypeOf<InferInput<Schema10>>().toEqualTypeOf<
        { foo: string[] } | undefined
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema3>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema4>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema5>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema6>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema7>>().toEqualTypeOf<number>();
      expectTypeOf<InferOutput<Schema8>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema9>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema10>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema3>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema4>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema5>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema6>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema7>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema8>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema9>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema10>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });
  });
});
