import { describe, expectTypeOf, test } from 'vitest';
import { transform } from '../../actions/index.ts';
import { array, number, object, string } from '../../schemas/index.ts';
import { fallback, fallbackAsync } from '../fallback/index.ts';
import { pipe } from '../pipe/index.ts';
import { getFallback } from './getFallback.ts';

describe('getFallback', () => {
  test('should return undefined', () => {
    expectTypeOf(getFallback(string())).toEqualTypeOf<undefined>();
    expectTypeOf(getFallback(number())).toEqualTypeOf<undefined>();
    expectTypeOf(getFallback(object({}))).toEqualTypeOf<undefined>();
  });

  describe('should return fallback for simple values', () => {
    const schema = pipe(string(), transform(parseInt));

    test('for direct value', () => {
      expectTypeOf(
        getFallback(fallback(schema, 123 as const))
      ).toEqualTypeOf<123>();
    });

    test('for value getter', () => {
      expectTypeOf(
        getFallback(fallback(schema, () => 123 as const))
      ).toEqualTypeOf<123>();
    });

    test('for async value getter', () => {
      expectTypeOf(
        getFallback(fallbackAsync(schema, async () => 123 as const))
      ).toEqualTypeOf<Promise<123>>();
    });
  });

  describe('should return fallback for object with array', () => {
    const schema = object({ foo: array(string()) });

    test('for direct value', () => {
      const value: { readonly foo: readonly string[] } = { foo: [] };
      expectTypeOf(getFallback(fallback(schema, value))).toEqualTypeOf<{
        readonly foo: readonly string[];
      }>();
    });

    test('for value getter', () => {
      const getter: () => { readonly foo: readonly string[] } = () => ({
        foo: [],
      });
      expectTypeOf(getFallback(fallback(schema, getter))).toEqualTypeOf<{
        readonly foo: readonly string[];
      }>();
    });

    test('for async value getter', () => {
      const getter: () => Promise<{
        readonly foo: readonly string[];
      }> = async () => ({ foo: [] });
      expectTypeOf(getFallback(fallbackAsync(schema, getter))).toEqualTypeOf<
        Promise<{ readonly foo: readonly string[] }>
      >();
    });
  });
});
