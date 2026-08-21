import { describe, expectTypeOf, test } from 'vitest';
import { transform } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import { object, string } from '../../schemas/index.ts';
import type { StandardProps } from '../../types/index.ts';

describe('_standardSchema', () => {
  test('should return spec properties', () => {
    expectTypeOf(string()['~standard']).toEqualTypeOf<
      StandardProps<string, string>
    >();
    expectTypeOf(pipe(string(), transform(Number))['~standard']).toEqualTypeOf<
      StandardProps<string, number>
    >();
    expectTypeOf(
      pipe(
        object({ foo: string() }),
        transform((input) => ({ ...input, bar: 123 }))
      )['~standard']
    ).toEqualTypeOf<
      StandardProps<{ foo: string }, { foo: string; bar: number }>
    >();
  });
});
