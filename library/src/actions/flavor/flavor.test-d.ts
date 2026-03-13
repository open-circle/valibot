import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { type Flavor, flavor, type FlavorAction } from './flavor.ts';

describe('flavor', () => {
  type Action = FlavorAction<string, 'foo'>;

  test('should return action object', () => {
    expectTypeOf(flavor<string, 'foo'>('foo')).toEqualTypeOf<Action>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<
        string & Flavor<'foo'>
      >();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<never>();
    });
  });

  describe('should only match specific types', () => {
    type Output = InferOutput<Action>;

    test('should match unflavored types', () => {
      expectTypeOf<string>().toMatchTypeOf<Output>();
    });

    test('should match types with same flavor', () => {
      expectTypeOf<
        InferOutput<FlavorAction<string, 'foo'>>
      >().toMatchTypeOf<Output>();
    });

    test('should not match types with different flavor', () => {
      expectTypeOf<
        InferOutput<FlavorAction<string, 'bar'>>
      >().not.toMatchTypeOf<Output>();
    });
  });
});
