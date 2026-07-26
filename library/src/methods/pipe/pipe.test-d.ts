import { describe, expectTypeOf, test } from 'vitest';
import {
  decimal,
  type DecimalAction,
  type DecimalIssue,
  description,
  type DescriptionAction,
  minLength,
  type MinLengthAction,
  type MinLengthIssue,
  minValue,
  type MinValueAction,
  type MinValueIssue,
  transform,
  type TransformAction,
  trim,
  type TrimAction,
} from '../../actions/index.ts';
import {
  number,
  type NumberIssue,
  type NumberSchema,
  string,
  type StringIssue,
  type StringSchema,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { pipe, type SchemaWithPipe } from './pipe.ts';

describe('pipe', () => {
  const schema = pipe(
    string(),
    description('text'),
    trim(),
    minLength(1),
    decimal(),
    transform(parseInt),
    number(),
    minValue(100)
  );

  test('should return schema object', () => {
    expectTypeOf(schema).toEqualTypeOf<
      SchemaWithPipe<
        readonly [
          StringSchema<undefined>,
          DescriptionAction<string, 'text'>,
          TrimAction,
          MinLengthAction<string, 1, undefined>,
          DecimalAction<string, undefined>,
          TransformAction<string, number>,
          NumberSchema<undefined>,
          MinValueAction<number, 100, undefined>,
        ]
      >
    >();
  });

  describe('should infer correct types', () => {
    type Schema = typeof schema;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<number>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
        | StringIssue
        | MinLengthIssue<string, 1>
        | DecimalIssue<string>
        | NumberIssue
        | MinValueIssue<number, 100>
      >();
    });
  });
});
