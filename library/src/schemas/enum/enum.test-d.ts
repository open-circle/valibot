import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { enum_, type EnumIssue, type EnumSchema } from './enum.ts';

describe('enum_', () => {
  enum normalEnum {
    option1 = 'foo',
    option2 = 'bar',
    option3 = 'baz',
  }
  type NormalEnum = typeof normalEnum;

  describe('should return schema object', () => {
    test('with undefined message', () => {
      type Schema = EnumSchema<NormalEnum, undefined>;
      expectTypeOf(enum_(normalEnum)).toEqualTypeOf<Schema>();
      expectTypeOf(enum_(normalEnum, undefined)).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(enum_(normalEnum, 'message')).toEqualTypeOf<
        EnumSchema<NormalEnum, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(enum_(normalEnum, () => 'message')).toEqualTypeOf<
        EnumSchema<NormalEnum, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type NormalEnumSchema = EnumSchema<NormalEnum, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<NormalEnumSchema>>().toEqualTypeOf<normalEnum>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<NormalEnumSchema>>().toEqualTypeOf<normalEnum>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<NormalEnumSchema>>().toEqualTypeOf<EnumIssue>();
    });
  });

  describe('should filter reverse mappings', () => {
    test('of special enums', () => {
      enum specialEnum {
        option1 = 'foo',
        option2 = 0,
        option3,
        Infinity,
        '-Infinity',
        NaN,
      }
      type SpecialEnum = typeof specialEnum;
      type SpecialEnumSchema = EnumSchema<SpecialEnum, undefined>;
      expectTypeOf<
        InferInput<SpecialEnumSchema>
      >().toEqualTypeOf<specialEnum>();
      expectTypeOf<
        InferOutput<SpecialEnumSchema>
      >().toEqualTypeOf<specialEnum>();
    });

    test('of normal enum-like object', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const normalEnumLike = {
        option0: 'foo',
        option1: 1111,
        option2: 2222,
        option3: 3333,
        option4: 4444,
        option5: 5555,
        option6: -6666,

        // No reverse mappings
        foo: 'option0', // Key is not a number
        '+1111': 'option1', // Key is not a reverse mapped number
        1234: 'option2', // Key does not match with reverse mapped value `2222`
        '5678': 'option3', // Key does not match with reverse mapped value `3333`

        // Reverse mappings
        4444: 'option4',
        '5555': 'option5',
        '-6666': 'option6',
      } as const;
      type NormalEnumLike = typeof normalEnumLike;
      type NormalEnumLikeSchema = EnumSchema<NormalEnumLike, undefined>;
      expectTypeOf<InferInput<NormalEnumLikeSchema>>().toEqualTypeOf<
        | 'foo'
        | 1111
        | 2222
        | 3333
        | 4444
        | 5555
        | -6666
        | 'option0'
        | 'option1'
        | 'option2'
        | 'option3'
      >();
      expectTypeOf<InferOutput<NormalEnumLikeSchema>>().toEqualTypeOf<
        | 'foo'
        | 1111
        | 2222
        | 3333
        | 4444
        | 5555
        | -6666
        | 'option0'
        | 'option1'
        | 'option2'
        | 'option3'
      >();
    });

    test('of special enum-like object', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const specialEnumLike = {
        option0: 'foo',
        option1: 1234,
        option2: Infinity,
        option3: -Infinity,
        option4: NaN,

        // Reverse mappings
        '1234': 'option1',
        Infinity: 'option2',
        '-Infinity': 'option3',
        NaN: 'option4',
      } as const;
      type SpecialEnumLike = typeof specialEnumLike;
      type SpecialEnumLikeSchema = EnumSchema<SpecialEnumLike, undefined>;
      expectTypeOf<InferInput<SpecialEnumLikeSchema>>().toEqualTypeOf<
        'foo' | number
      >();
      expectTypeOf<InferOutput<SpecialEnumLikeSchema>>().toEqualTypeOf<
        'foo' | number
      >();
    });
  });
});
