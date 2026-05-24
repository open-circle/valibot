import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { array, type ArrayIssue } from '../array/index.ts';
import {
  number,
  type NumberIssue,
  type NumberSchema,
} from '../number/index.ts';
import {
  object,
  type ObjectIssue,
  type ObjectSchema,
} from '../object/index.ts';
import { optional } from '../optional/optional.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import { intersect, type IntersectSchema } from './intersect.ts';
import type { IntersectIssue } from './types.ts';

describe('intersect', () => {
  const options = [
    array(object({ key1: string() })),
    array(object({ key2: optional(number(), 123) })),
  ] as const;
  type Options = typeof options;

  describe('should return schema object', () => {
    test('with undefined message', () => {
      type Schema = IntersectSchema<Options, undefined>;
      expectTypeOf(intersect(options)).toEqualTypeOf<Schema>();
      expectTypeOf(intersect(options, undefined)).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(intersect(options, 'message')).toEqualTypeOf<
        IntersectSchema<Options, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(intersect(options, () => 'message')).toEqualTypeOf<
        IntersectSchema<Options, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema = IntersectSchema<Options, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
        { key1: string }[] & { key2?: number | undefined }[]
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
        { key1: string }[] & { key2: number }[]
      >();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
        IntersectIssue | ArrayIssue | ObjectIssue | StringIssue | NumberIssue
      >();
    });
  });

  describe('should infer correct types for non-tuple array options', () => {
    // A general array of options (not a fixed tuple) — e.g. when building an
    // intersect dynamically or annotating `IntersectSchema<Schema[], ...>`.
    type ArrayOptions = (
      | ObjectSchema<{ key1: StringSchema<undefined> }, undefined>
      | ObjectSchema<{ key2: NumberSchema<undefined> }, undefined>
    )[];
    type Schema = IntersectSchema<ArrayOptions, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
        { key1: string } & { key2: number }
      >();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
        { key1: string } & { key2: number }
      >();
    });
  });
});
