import { describe, expectTypeOf, test } from 'vitest';
import {
  boolean,
  type BooleanIssue,
  type NonOptionalIssue,
  nullishAsync,
  number,
  type NumberIssue,
  objectAsync,
  type ObjectIssue,
  objectWithRestAsync,
  type ObjectWithRestIssue,
  optional,
  optionalAsync,
  string,
  type StringIssue,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  requiredAsync,
  type SchemaWithRequiredAsync,
} from './requiredAsync.ts';

describe('requiredAsync', () => {
  const entries = {
    key1: optional(string()),
    key2: optional(number()),
    key3: optionalAsync(string()),
    key4: nullishAsync(number(), async () => 123),
  };

  describe('objectAsync', () => {
    const wrapped = objectAsync(entries);
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithRequiredAsync<Wrapped, undefined, undefined>;
    type Schema2 = SchemaWithRequiredAsync<
      Wrapped,
      ['key1', 'key3'],
      undefined
    >;

    describe('should return schema object', () => {
      test('with undefined keys', () => {
        expectTypeOf(requiredAsync(wrapped)).toEqualTypeOf<Schema1>();
        expectTypeOf(
          requiredAsync(wrapped, undefined)
        ).toEqualTypeOf<Schema1>();
        expectTypeOf(requiredAsync(wrapped, 'message')).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, undefined, 'message'>
        >();
        expectTypeOf(requiredAsync(wrapped, () => 'message')).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, undefined, () => string>
        >();
      });

      test('with specific keys', () => {
        expectTypeOf(
          requiredAsync(wrapped, ['key1', 'key3'])
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          requiredAsync(wrapped, ['key1', 'key3'], undefined)
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          requiredAsync(wrapped, ['key1', 'key3'], 'message')
        ).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, ['key1', 'key3'], 'message'>
        >();
        expectTypeOf(
          requiredAsync(wrapped, ['key1', 'key3'], () => 'message')
        ).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, ['key1', 'key3'], () => string>
        >();
      });
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<{
          key1: string;
          key2: number;
          key3: string;
          key4: number | null;
        }>();
        expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<{
          key1: string;
          key2?: number | undefined;
          key3: string;
          key4?: number | null | undefined;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<{
          key1: string;
          key2: number;
          key3: string;
          key4: number;
        }>();
        expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<{
          key1: string;
          key2?: number | undefined;
          key3: string;
          key4: number;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<
          NonOptionalIssue | ObjectIssue | StringIssue | NumberIssue
        >();
        expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<
          NonOptionalIssue | ObjectIssue | StringIssue | NumberIssue
        >();
      });
    });
  });

  describe('objectWithRestAsync', () => {
    const wrapped = objectWithRestAsync(entries, boolean());
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithRequiredAsync<Wrapped, undefined, undefined>;
    type Schema2 = SchemaWithRequiredAsync<
      Wrapped,
      ['key2', 'key3'],
      undefined
    >;

    describe('should return schema object', () => {
      test('with undefined keys', () => {
        expectTypeOf(requiredAsync(wrapped)).toEqualTypeOf<Schema1>();
        expectTypeOf(
          requiredAsync(wrapped, undefined)
        ).toEqualTypeOf<Schema1>();
        expectTypeOf(requiredAsync(wrapped, 'message')).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, undefined, 'message'>
        >();
        expectTypeOf(requiredAsync(wrapped, () => 'message')).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, undefined, () => string>
        >();
      });

      test('with specific keys', () => {
        expectTypeOf(
          requiredAsync(wrapped, ['key2', 'key3'])
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          requiredAsync(wrapped, ['key2', 'key3'], undefined)
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          requiredAsync(wrapped, ['key2', 'key3'], 'message')
        ).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, ['key2', 'key3'], 'message'>
        >();
        expectTypeOf(
          requiredAsync(wrapped, ['key2', 'key3'], () => 'message')
        ).toEqualTypeOf<
          SchemaWithRequiredAsync<Wrapped, ['key2', 'key3'], () => string>
        >();
      });
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema1>>().toEqualTypeOf<
          {
            key1: string;
            key2: number;
            key3: string;
            key4: number | null;
          } & { [key: string]: boolean }
        >();
        expectTypeOf<InferInput<Schema2>>().toEqualTypeOf<
          {
            key1?: string | undefined;
            key2: number;
            key3: string;
            key4?: number | null | undefined;
          } & { [key: string]: boolean }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema1>>().toEqualTypeOf<
          {
            key1: string;
            key2: number;
            key3: string;
            key4: number;
          } & { [key: string]: boolean }
        >();
        expectTypeOf<InferOutput<Schema2>>().toEqualTypeOf<
          {
            key1?: string | undefined;
            key2: number;
            key3: string;
            key4: number;
          } & { [key: string]: boolean }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema1>>().toEqualTypeOf<
          | NonOptionalIssue
          | ObjectWithRestIssue
          | NumberIssue
          | StringIssue
          | BooleanIssue
        >();
        expectTypeOf<InferIssue<Schema2>>().toEqualTypeOf<
          | NonOptionalIssue
          | ObjectWithRestIssue
          | NumberIssue
          | StringIssue
          | BooleanIssue
        >();
      });
    });
  });
});
