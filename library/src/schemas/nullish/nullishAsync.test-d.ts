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
import { nullishAsync, type NullishSchemaAsync } from './nullishAsync.ts';

describe('nullishAsync', () => {
  describe('should return schema object', () => {
    test('with undefined default', () => {
      type Schema = NullishSchemaAsync<StringSchema<undefined>, undefined>;
      expectTypeOf(nullishAsync(string())).toEqualTypeOf<Schema>();
      expectTypeOf(nullishAsync(string(), undefined)).toEqualTypeOf<Schema>();
    });

    test('with undefined getter default', () => {
      expectTypeOf(nullishAsync(string(), () => undefined)).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, () => undefined>
      >();
    });

    test('with async undefined getter default', () => {
      expectTypeOf(nullishAsync(string(), async () => undefined)).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, () => Promise<undefined>>
      >();
    });

    test('with null default', () => {
      expectTypeOf(nullishAsync(string(), null)).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, null>
      >();
    });

    test('with null getter default', () => {
      expectTypeOf(nullishAsync(string(), () => null)).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, () => null>
      >();
    });

    test('with async null getter default', () => {
      expectTypeOf(nullishAsync(string(), async () => null)).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, () => Promise<null>>
      >();
    });

    test('with value default', () => {
      expectTypeOf(nullishAsync(string(), 'foo')).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, 'foo'>
      >();
    });

    test('with value getter default', () => {
      expectTypeOf(nullishAsync(string(), () => 'foo')).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, () => string>
      >();
    });

    test('with async value getter default', () => {
      expectTypeOf(nullishAsync(string(), async () => 'foo')).toEqualTypeOf<
        NullishSchemaAsync<StringSchema<undefined>, () => Promise<string>>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema1 = NullishSchemaAsync<StringSchema<undefined>, undefined>;
    type Schema2 = NullishSchemaAsync<StringSchema<undefined>, null>;
    type Schema3 = NullishSchemaAsync<StringSchema<undefined>, 'foo'>;
    type Schema4 = NullishSchemaAsync<StringSchema<undefined>, () => undefined>;
    type Schema5 = NullishSchemaAsync<StringSchema<undefined>, () => null>;
    type Schema6 = NullishSchemaAsync<StringSchema<undefined>, () => 'foo'>;
    type Schema7 = NullishSchemaAsync<
      StringSchema<undefined>,
      () => Promise<undefined>
    >;
    type Schema8 = NullishSchemaAsync<
      StringSchema<undefined>,
      () => Promise<null>
    >;
    type Schema9 = NullishSchemaAsync<
      StringSchema<undefined>,
      () => Promise<'foo'>
    >;
    type Schema10 = NullishSchemaAsync<
      SchemaWithPipeAsync<
        [StringSchema<undefined>, TransformActionAsync<string, number>]
      >,
      'foo'
    >;
    type Schema11 = NullishSchemaAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      { foo: string[] }
    >;
    type Schema12 = NullishSchemaAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => { foo: string[] }
    >;
    type Schema13 = NullishSchemaAsync<
      ObjectSchema<
        { foo: ArraySchema<StringSchema<undefined>, undefined> },
        undefined
      >,
      () => Promise<{ foo: string[] }>
    >;

    test('of input', () => {
      type Input = string | null | undefined;
      expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema3>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema4>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema5>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema6>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema7>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema8>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema9>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema10>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Schema11>>().toEqualTypeOf<
        { foo: string[] } | null | undefined
      >();
      expectTypeOf<InferInput<Schema12>>().toEqualTypeOf<
        { foo: string[] } | null | undefined
      >();
      expectTypeOf<InferInput<Schema13>>().toEqualTypeOf<
        { foo: string[] } | null | undefined
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<
        string | null | undefined
      >();
      expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<string | null>();
      expectTypeOf<InferOutput<Schema3>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema4>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema5>>().toEqualTypeOf<string | null>();
      expectTypeOf<InferOutput<Schema6>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema7>>().toEqualTypeOf<string | undefined>();
      expectTypeOf<InferOutput<Schema8>>().toEqualTypeOf<string | null>();
      expectTypeOf<InferOutput<Schema9>>().toEqualTypeOf<string>();
      expectTypeOf<InferOutput<Schema10>>().toEqualTypeOf<number>();
      expectTypeOf<InferOutput<Schema11>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema12>>().toEqualTypeOf<{ foo: string[] }>();
      expectTypeOf<InferOutput<Schema13>>().toEqualTypeOf<{ foo: string[] }>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema3>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema4>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema5>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema6>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema7>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema8>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema9>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema10>>().toEqualTypeOf<StringIssue>();
      expectTypeOf<InferIssue<Schema11>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema12>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
      expectTypeOf<InferIssue<Schema13>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });
  });
});
