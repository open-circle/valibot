import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { type Brand, brand, type BrandAction } from './brand.ts';

describe('brand', () => {
  type Action = BrandAction<string, 'foo'>;

  test('should return action object', () => {
    expectTypeOf(brand<string, 'foo'>('foo')).toEqualTypeOf<Action>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<
        string & Brand<'foo'>
      >();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<never>();
    });
  });

  describe('should only match specific types', () => {
    type Output = InferOutput<Action>;

    test('should not match unbranded types', () => {
      expectTypeOf<string>().not.toMatchTypeOf<Output>();
    });

    test('should match types with same brand', () => {
      expectTypeOf<
        InferOutput<BrandAction<string, 'foo'>>
      >().toMatchTypeOf<Output>();
    });

    test('should not match types with different brand', () => {
      expectTypeOf<
        InferOutput<BrandAction<string, 'bar'>>
      >().not.toMatchTypeOf<Output>();
    });
  });
});
