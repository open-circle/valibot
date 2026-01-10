import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  stringbool,
  type StringboolAction,
  type StringboolIssue,
  type StringboolOptions,
} from './stringbool.ts';

describe('stringbool', () => {
  describe('should return action object', () => {
    test('with undefined options', () => {
      type Action = StringboolAction<'foo', StringboolOptions>;

      expectTypeOf(stringbool<'foo'>()).toEqualTypeOf<Action>();
      expectTypeOf(stringbool<'foo'>(undefined)).toEqualTypeOf<Action>();
    });

    test('with custom options', () => {
      const options: StringboolOptions = {
        truthy: ['yep'],
        falsy: ['nope'],
        case: 'sensitive',
      };

      expectTypeOf(stringbool<'foo'>(options)).toEqualTypeOf<
        StringboolAction<'foo', StringboolOptions>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = StringboolAction<'foo', StringboolOptions>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<'foo'>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<boolean>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        StringboolIssue<'foo'>
      >();
    });
  });
});
