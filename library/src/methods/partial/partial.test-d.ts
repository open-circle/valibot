import { describe, expectTypeOf, test } from 'vitest';
import {
  boolean,
  type BooleanIssue,
  nullish,
  number,
  type NumberIssue,
  object,
  type ObjectIssue,
  objectWithRest,
  type ObjectWithRestIssue,
  string,
  type StringIssue,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { partial, type SchemaWithPartial } from './partial.ts';

describe('partial', () => {
  const entries = {
    key1: string(),
    key2: number(),
    key3: string(),
    key4: nullish(number(), () => 123),
  };

  describe('object', () => {
    const wrapped = object(entries);
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithPartial<Wrapped, undefined>;
    type Schema2 = SchemaWithPartial<Wrapped, ['key1', 'key3']>;

    describe('should return schema object', () => {
      test('with undefined keys', () => {
        expectTypeOf(partial(wrapped)).toEqualTypeOf<Schema1>();
      });

      test('with specific keys', () => {
        expectTypeOf(
          partial(wrapped, ['key1', 'key3'])
        ).toEqualTypeOf<Schema2>();
      });
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<{
          key1?: string | undefined;
          key2?: number | undefined;
          key3?: string | undefined;
          key4?: number | null | undefined;
        }>();
        expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<{
          key1?: string | undefined;
          key2: number;
          key3?: string | undefined;
          key4?: number | null | undefined;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<{
          key1?: string | undefined;
          key2?: number | undefined;
          key3?: string | undefined;
          key4?: number | undefined;
        }>();
        expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<{
          key1?: string | undefined;
          key2: number;
          key3?: string | undefined;
          key4: number;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<
          ObjectIssue | StringIssue | NumberIssue
        >();
        expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<
          ObjectIssue | StringIssue | NumberIssue
        >();
      });
    });
  });

  describe('objectWithRest', () => {
    const wrapped = objectWithRest(entries, boolean());
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithPartial<Wrapped, undefined>;
    type Schema2 = SchemaWithPartial<Wrapped, ['key2', 'key3']>;

    describe('should return schema object', () => {
      test('with undefined keys', () => {
        expectTypeOf(partial(wrapped)).toEqualTypeOf<Schema1>();
      });

      test('with specific keys', () => {
        expectTypeOf(
          partial(wrapped, ['key2', 'key3'])
        ).toEqualTypeOf<Schema2>();
      });
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<
          {
            key1?: string | undefined;
            key2?: number | undefined;
            key3?: string | undefined;
            key4?: number | null | undefined;
          } & { [key: string]: boolean }
        >();
        expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<
          {
            key1: string;
            key2?: number | undefined;
            key3?: string | undefined;
            key4?: number | null | undefined;
          } & { [key: string]: boolean }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<
          {
            key1?: string | undefined;
            key2?: number | undefined;
            key3?: string | undefined;
            key4?: number | undefined;
          } & { [key: string]: boolean }
        >();
        expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<
          {
            key1: string;
            key2?: number | undefined;
            key3?: string | undefined;
            key4: number;
          } & { [key: string]: boolean }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<
          ObjectWithRestIssue | NumberIssue | StringIssue | BooleanIssue
        >();
        expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<
          ObjectWithRestIssue | NumberIssue | StringIssue | BooleanIssue
        >();
      });
    });
  });
});
