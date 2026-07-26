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
  type TransformActionAsync,
  transformAsync,
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
import { pipeAsync, type SchemaWithPipeAsync } from './pipeAsync.ts';

describe('pipeAsync', () => {
  const schema = pipeAsync(
    string(),
    description('text'),
    trim(),
    minLength(1),
    decimal(),
    transformAsync(async (input) => parseInt(input)),
    number(),
    minValue(100)
  );

  test('should return schema object', () => {
    expectTypeOf(schema).toEqualTypeOf<
      SchemaWithPipeAsync<
        readonly [
          StringSchema<undefined>,
          DescriptionAction<string, 'text'>,
          TrimAction,
          MinLengthAction<string, 1, undefined>,
          DecimalAction<string, undefined>,
          TransformActionAsync<string, number>,
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
