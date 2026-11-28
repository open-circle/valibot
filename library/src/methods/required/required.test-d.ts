import { describe, expectTypeOf, test } from 'vitest';
import {
  boolean,
  type BooleanIssue,
  type NonOptionalIssue,
  nullish,
  number,
  type NumberIssue,
  object,
  type ObjectIssue,
  objectWithRest,
  type ObjectWithRestIssue,
  optional,
  string,
  type StringIssue,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { required, type SchemaWithRequired } from './required.ts';

describe('required', () => {
  const entries = {
    key1: optional(string()),
    key2: optional(number()),
    key3: optional(string()),
    key4: nullish(number(), () => 123),
  };

  describe('object', () => {
    const wrapped = object(entries);
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithRequired<Wrapped, undefined, undefined>;
    type Schema2 = SchemaWithRequired<Wrapped, ['key1', 'key3'], undefined>;

    describe('should return schema object', () => {
      test('with undefined keys', () => {
        expectTypeOf(required(wrapped)).toEqualTypeOf<Schema1>();
        expectTypeOf(required(wrapped, undefined)).toEqualTypeOf<Schema1>();
        expectTypeOf(required(wrapped, 'message')).toEqualTypeOf<
          SchemaWithRequired<Wrapped, undefined, 'message'>
        >();
        expectTypeOf(required(wrapped, () => 'message')).toEqualTypeOf<
          SchemaWithRequired<Wrapped, undefined, () => string>
        >();
      });

      test('with specific keys', () => {
        expectTypeOf(
          required(wrapped, ['key1', 'key3'])
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          required(wrapped, ['key1', 'key3'], undefined)
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          required(wrapped, ['key1', 'key3'], 'message')
        ).toEqualTypeOf<
          SchemaWithRequired<Wrapped, ['key1', 'key3'], 'message'>
        >();
        expectTypeOf(
          required(wrapped, ['key1', 'key3'], () => 'message')
        ).toEqualTypeOf<
          SchemaWithRequired<Wrapped, ['key1', 'key3'], () => string>
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

  describe('objectWithRest', () => {
    const wrapped = objectWithRest(entries, boolean());
    type Wrapped = typeof wrapped;
    type Schema1 = SchemaWithRequired<Wrapped, undefined, undefined>;
    type Schema2 = SchemaWithRequired<Wrapped, ['key2', 'key3'], undefined>;

    describe('should return schema object', () => {
      test('with undefined keys', () => {
        expectTypeOf(required(wrapped)).toEqualTypeOf<Schema1>();
        expectTypeOf(required(wrapped, undefined)).toEqualTypeOf<Schema1>();
        expectTypeOf(required(wrapped, 'message')).toEqualTypeOf<
          SchemaWithRequired<Wrapped, undefined, 'message'>
        >();
        expectTypeOf(required(wrapped, () => 'message')).toEqualTypeOf<
          SchemaWithRequired<Wrapped, undefined, () => string>
        >();
      });

      test('with specific keys', () => {
        expectTypeOf(
          required(wrapped, ['key2', 'key3'])
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          required(wrapped, ['key2', 'key3'], undefined)
        ).toEqualTypeOf<Schema2>();
        expectTypeOf(
          required(wrapped, ['key2', 'key3'], 'message')
        ).toEqualTypeOf<
          SchemaWithRequired<Wrapped, ['key2', 'key3'], 'message'>
        >();
        expectTypeOf(
          required(wrapped, ['key2', 'key3'], () => 'message')
        ).toEqualTypeOf<
          SchemaWithRequired<Wrapped, ['key2', 'key3'], () => string>
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
