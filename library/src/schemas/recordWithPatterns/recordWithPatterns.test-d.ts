import { describe, expectTypeOf, test } from 'vitest';
import { transform } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import type { BooleanIssue, BooleanSchema } from '../boolean/boolean.ts';
import { boolean } from '../boolean/boolean.ts';
import { custom } from '../custom/custom.ts';
import type { CustomIssue } from '../custom/types.ts';
import type { NumberIssue, NumberSchema } from '../number/number.ts';
import { number } from '../number/number.ts';
import type { StringIssue, StringSchema } from '../string/string.ts';
import { string } from '../string/string.ts';
import type { RecordWithPatternsSchema } from './recordWithPatterns.ts';
import { recordWithPatterns } from './recordWithPatterns.ts';
import type { RecordWithPatternsIssue } from './types.ts';

const FooKeySchema = custom<`foo(${string})`>(
  (input) =>
    typeof input === 'string' && input.startsWith('foo(') && input.endsWith(')')
);

const BarKeySchema = pipe(
  custom<`bar(${string})`>(
    (input) =>
      typeof input === 'string' &&
      input.startsWith('bar(') &&
      input.endsWith(')')
  ),
  transform((input) => input.toUpperCase() as Uppercase<typeof input>)
);

describe('recordWithPatterns', () => {
  describe('should return schema object', () => {
    test('without message', () => {
      expectTypeOf(
        recordWithPatterns(
          [
            [FooKeySchema, string()],
            [BarKeySchema, number()],
          ],
          boolean()
        )
      ).toEqualTypeOf<
        RecordWithPatternsSchema<
          readonly [
            readonly [typeof FooKeySchema, StringSchema<undefined>],
            readonly [typeof BarKeySchema, NumberSchema<undefined>],
          ],
          BooleanSchema<undefined>,
          undefined
        >
      >();
    });
    test('with message', () => {
      expectTypeOf(
        recordWithPatterns(
          [
            [FooKeySchema, string()],
            [BarKeySchema, number()],
          ],
          boolean(),
          'message'
        )
      ).toEqualTypeOf<
        RecordWithPatternsSchema<
          readonly [
            readonly [typeof FooKeySchema, StringSchema<undefined>],
            readonly [typeof BarKeySchema, NumberSchema<undefined>],
          ],
          BooleanSchema<undefined>,
          'message'
        >
      >();
    });
  });
  describe('should return inference types', () => {
    test('of input', () => {
      expectTypeOf<
        InferInput<
          RecordWithPatternsSchema<
            readonly [
              readonly [typeof FooKeySchema, StringSchema<undefined>],
              readonly [typeof BarKeySchema, NumberSchema<undefined>],
            ],
            BooleanSchema<undefined>,
            undefined
          >
        >
      >().toEqualTypeOf<
        {
          [key: `foo(${string})`]: string | undefined;
          [key: `bar(${string})`]: number | undefined;
        } & { [key: string]: boolean }
      >();
    });
    test('of output', () => {
      expectTypeOf<
        InferOutput<
          RecordWithPatternsSchema<
            readonly [
              readonly [typeof FooKeySchema, StringSchema<undefined>],
              readonly [typeof BarKeySchema, NumberSchema<undefined>],
            ],
            BooleanSchema<undefined>,
            undefined
          >
        >
      >().toEqualTypeOf<
        {
          [key: `foo(${string})`]: string | undefined;
          [key: `BAR(${Uppercase<string>})`]: number | undefined;
        } & { [key: string]: boolean }
      >();
    });
    test('of issue', () => {
      expectTypeOf<
        InferIssue<
          RecordWithPatternsSchema<
            readonly [
              readonly [typeof FooKeySchema, StringSchema<undefined>],
              readonly [typeof BarKeySchema, NumberSchema<undefined>],
            ],
            BooleanSchema<undefined>,
            undefined
          >
        >
      >().toEqualTypeOf<
        | RecordWithPatternsIssue
        | CustomIssue
        | StringIssue
        | NumberIssue
        | BooleanIssue
      >();
    });
  });
});
