import { describe, expectTypeOf, test } from 'vitest';
import { pipe } from '../../methods/index.ts';
import { string } from '../../schemas/index.ts';
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
      expectTypeOf<string>().not.toExtend<Output>();
    });

    test('should match types with same brand', () => {
      expectTypeOf<
        InferOutput<BrandAction<string, 'foo'>>
      >().toExtend<Output>();
    });

    test('should not match types with different brand', () => {
      expectTypeOf<
        InferOutput<BrandAction<string, 'bar'>>
      >().not.toExtend<Output>();
    });
  });

  describe('should combine multiple brands', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(string(), brand('foo'), brand('bar'));
    type Output = InferOutput<typeof schema>;

    test('should not be never', () => {
      expectTypeOf<Output>().not.toBeNever();
    });

    test('should match each brand', () => {
      expectTypeOf<Output>().toExtend<string & Brand<'foo'>>();
      expectTypeOf<Output>().toExtend<string & Brand<'bar'>>();
    });

    test('should not match single brand', () => {
      expectTypeOf<string & Brand<'foo'>>().not.toExtend<Output>();
    });
  });
});
