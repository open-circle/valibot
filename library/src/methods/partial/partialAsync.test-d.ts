import { describe, expectTypeOf, test } from 'vitest';
import {
  boolean,
  type BooleanIssue,
  nullishAsync,
  number,
  type NumberIssue,
  objectAsync,
  type ObjectIssue,
  objectWithRestAsync,
  type ObjectWithRestIssue,
  string,
  type StringIssue,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { partialAsync, type SchemaWithPartialAsync } from './partialAsync.ts';

describe('partialAsync', () => {
  const entries = {
    key1: string(),
    key2: number(),
    key3: string(),
    key4: nullishAsync(number(), async () => 123),
  };

  describe('objectAsync', () => {
    const wrapped = objectAsync(entries);
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithPartialAsync<Wrapped, undefined>;
    type Schema2 = SchemaWithPartialAsync<Wrapped, ['key1', 'key3']>;

    describe('should return schema objectAsync', () => {
      test('with undefined keys', () => {
        expectTypeOf(partialAsync(wrapped)).toEqualTypeOf<Schema1>();
      });

      test('with specific keys', () => {
        expectTypeOf(
          partialAsync(wrapped, ['key1', 'key3'])
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

  describe('objectWithRestAsync', () => {
    const wrapped = objectWithRestAsync(entries, boolean());
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithPartialAsync<Wrapped, undefined>;
    type Schema2 = SchemaWithPartialAsync<Wrapped, ['key2', 'key3']>;

    describe('should return schema objectAsync', () => {
      test('with undefined keys', () => {
        expectTypeOf(partialAsync(wrapped)).toEqualTypeOf<Schema1>();
      });

      test('with specific keys', () => {
        expectTypeOf(
          partialAsync(wrapped, ['key2', 'key3'])
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
