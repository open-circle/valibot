import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { slug, type SlugAction, type SlugIssue } from './slug.ts';

describe('slug', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = SlugAction<string, undefined>;
      expectTypeOf(slug()).toEqualTypeOf<Action>();
      expectTypeOf(slug(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(slug('message')).toEqualTypeOf<
        SlugAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(slug(() => 'message')).toEqualTypeOf<
        SlugAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = SlugAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<SlugIssue<string>>();
    });
  });
});
