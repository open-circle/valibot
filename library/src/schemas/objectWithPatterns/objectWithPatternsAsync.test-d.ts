import { describe, expectTypeOf, test } from 'vitest';
import { transformAsync } from '../../actions/index.ts';
import { pipeAsync } from '../../methods/index.ts';
import type {
  CustomIssue,
  ObjectWithPatternsIssue,
  ObjectWithPatternsSchemaAsync,
  StringIssue,
  StringSchema,
} from '../../schemas/index.ts';
import {
  customAsync,
  objectWithPatternsAsync,
  string,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';

const FooKeySchema = customAsync<`foo(${string})`>(
  (input) =>
    typeof input === 'string' && input.startsWith('foo(') && input.endsWith(')')
);

const BarKeySchema = pipeAsync(
  customAsync<`bar(${string})`>(
    (input) =>
      typeof input === 'string' &&
      input.startsWith('bar(') &&
      input.endsWith(')')
  ),
  transformAsync(
    async (input) => input.toUpperCase() as Uppercase<typeof input>
  )
);

describe('objectWithPatternsAsync', () => {
  describe('should return schema object', () => {
    test('without message', () => {
      expectTypeOf(
        objectWithPatternsAsync(
          [
            [FooKeySchema, string()],
            [BarKeySchema, string()],
          ],
          string()
        )
      ).toEqualTypeOf<
        ObjectWithPatternsSchemaAsync<
          readonly [
            readonly [typeof FooKeySchema, StringSchema<undefined>],
            readonly [typeof BarKeySchema, StringSchema<undefined>],
          ],
          StringSchema<undefined>,
          undefined
        >
      >();
    });

    test('with message', () => {
      expectTypeOf(
        objectWithPatternsAsync(
          [
            [FooKeySchema, string()],
            [BarKeySchema, string()],
          ],
          string(),
          'message'
        )
      ).toEqualTypeOf<
        ObjectWithPatternsSchemaAsync<
          readonly [
            readonly [typeof FooKeySchema, StringSchema<undefined>],
            readonly [typeof BarKeySchema, StringSchema<undefined>],
          ],
          StringSchema<undefined>,
          'message'
        >
      >();
    });
  });

  describe('should return inferred type', () => {
    test('of input', () => {
      expectTypeOf<
        InferInput<
          ObjectWithPatternsSchemaAsync<
            readonly [
              readonly [typeof FooKeySchema, StringSchema<undefined>],
              readonly [typeof BarKeySchema, StringSchema<undefined>],
            ],
            StringSchema<undefined>,
            undefined
          >
        >
      >().toEqualTypeOf<
        {
          [key: `foo(${string})`]: string | undefined;
          [key: `bar(${string})`]: string | undefined;
        } & { [key: string]: string }
      >();
    });
    test('of output', () => {
      expectTypeOf<
        InferOutput<
          ObjectWithPatternsSchemaAsync<
            readonly [
              readonly [typeof FooKeySchema, StringSchema<undefined>],
              readonly [typeof BarKeySchema, StringSchema<undefined>],
            ],
            StringSchema<undefined>,
            undefined
          >
        >
      >().toEqualTypeOf<
        {
          [key: `foo(${string})`]: string | undefined;
          [key: `BAR(${Uppercase<string>})`]: string | undefined;
        } & { [key: string]: string }
      >();
    });
    test('of issue', () => {
      expectTypeOf<
        InferIssue<
          ObjectWithPatternsSchemaAsync<
            readonly [
              readonly [typeof FooKeySchema, StringSchema<undefined>],
              readonly [typeof BarKeySchema, StringSchema<undefined>],
            ],
            StringSchema<undefined>,
            undefined
          >
        >
      >().toEqualTypeOf<ObjectWithPatternsIssue | CustomIssue | StringIssue>();
    });
  });
});
