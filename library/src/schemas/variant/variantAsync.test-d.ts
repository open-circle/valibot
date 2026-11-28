import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { exactOptionalAsync } from '../exactOptional/index.ts';
import { literal, type LiteralIssue } from '../literal/index.ts';
import { nullishAsync } from '../nullish/index.ts';
import { object, objectAsync } from '../object/index.ts';
import { optionalAsync } from '../optional/index.ts';
import {
  strictObjectAsync,
  type StrictObjectIssue,
} from '../strictObject/index.ts';
import type { VariantIssue } from './types.ts';
import { variantAsync, type VariantSchemaAsync } from './variantAsync.ts';

describe('variantAsync', () => {
  const key = 'type' as const;
  type Key = typeof key;
  const options = [
    object({ type: literal('foo') }),
    strictObjectAsync({ type: literal('bar') }),
  ] as const;
  type Options = typeof options;

  describe('should return schema object', () => {
    test('with undefined message', () => {
      type Schema = VariantSchemaAsync<Key, Options, undefined>;
      expectTypeOf(variantAsync(key, options)).toEqualTypeOf<Schema>();
      expectTypeOf(
        variantAsync(key, options, undefined)
      ).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(variantAsync(key, options, 'message')).toEqualTypeOf<
        VariantSchemaAsync<Key, Options, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(variantAsync(key, options, () => 'message')).toEqualTypeOf<
        VariantSchemaAsync<Key, Options, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema = VariantSchemaAsync<Key, Options, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
        { type: 'foo' } | { type: 'bar' }
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
        { type: 'foo' } | { type: 'bar' }
      >();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
        VariantIssue | StrictObjectIssue | LiteralIssue
      >();
    });
  });

  describe('should infer correct types of optional discriminators', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = variantAsync(key, [
      objectAsync({ type: optionalAsync(literal('foo')) }),
      objectAsync({ type: exactOptionalAsync(literal('bar')) }),
      objectAsync({ type: nullishAsync(literal('baz')) }),
    ]);
    type Schema = typeof schema;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
        | { type?: 'foo' | undefined }
        | { type?: 'bar' }
        | { type?: 'baz' | null | undefined }
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
        | { type?: 'foo' | undefined }
        | { type?: 'bar' }
        | { type?: 'baz' | null | undefined }
      >();
    });
  });
});
