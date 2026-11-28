import { describe, expectTypeOf, test } from 'vitest';
import { transform, transformAsync } from '../../actions/index.ts';
import { fallbackAsync, pipe, pipeAsync } from '../../methods/index.ts';
import { object, string, type StringSchema } from '../../schemas/index.ts';
import type { StandardProps } from '../../types/index.ts';
import { _standardSchema } from './_standardSchema.ts';

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

  test('should infer async standard input and output', () => {
    const schema = pipeAsync(
      string(),
      transformAsync(async (input) => input.length)
    );
    expectTypeOf(schema['~standard']).toEqualTypeOf<
      StandardProps<string, number>
    >();
    expectTypeOf(
      fallbackAsync(schema, async () => 0)['~standard']
    ).toEqualTypeOf<StandardProps<string, number>>();
  });

  test('should check the schema run method', () => {
    _standardSchema<StringSchema<undefined>>({
      ...string(),
      // @ts-expect-error
      '~run': () => ({ typed: true, value: 123 }),
    });
    _standardSchema<StringSchema<undefined>>({
      ...string(),
      // @ts-expect-error
      '~run': async () => ({ typed: true, value: 'foo' }),
    });
  });
});
