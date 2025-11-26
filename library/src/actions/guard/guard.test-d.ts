import { describe, expectTypeOf, test } from 'vitest';
import { pipe } from '../../methods/index.ts';
import { literal, number, string } from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import type { GuardAction, GuardIssue } from './guard.ts';
import { guard } from './guard.ts';

describe('guard', () => {
  type PixelString = `${number}px`;
  const isPixelString = (input: string): input is PixelString =>
    /^\d+px$/u.test(input);

  describe('should return action object', () => {
    test('with no message', () => {
      expectTypeOf(guard(isPixelString)).toEqualTypeOf<
        GuardAction<string, typeof isPixelString, undefined>
      >();
    });
    test('with string message', () => {
      expectTypeOf(guard(isPixelString, 'message')).toEqualTypeOf<
        GuardAction<string, typeof isPixelString, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(guard(isPixelString, () => 'message')).toEqualTypeOf<
        GuardAction<string, typeof isPixelString, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<
        InferInput<GuardAction<string, typeof isPixelString, undefined>>
      >().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<
        InferOutput<GuardAction<string, typeof isPixelString, undefined>>
      >().toEqualTypeOf<PixelString>();
    });

    test('of issue', () => {
      expectTypeOf<
        InferIssue<GuardAction<string, typeof isPixelString, undefined>>
      >().toEqualTypeOf<GuardIssue<string, typeof isPixelString>>();
    });
  });

  test('should infer correct type in pipe', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(
      string(),
      guard((input) => {
        expectTypeOf(input).toEqualTypeOf<string>();
        return isPixelString(input);
      })
    );
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<PixelString>();
  });

  test("should error if pipe input doesn't match", () => {
    pipe(
      number(),
      // @ts-expect-error
      guard(isPixelString)
    );
  });

  test('should allow narrower input or wider output', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const narrowInput = pipe(
      string(),
      // guard allows wider input than current pipe
      guard(
        (input: unknown) => typeof input === 'string' && isPixelString(input)
      )
    );

    expectTypeOf<
      InferOutput<typeof narrowInput>
    >().toEqualTypeOf<PixelString>();

    // guarded type is wider than current pipe
    // so we keep the narrower type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const wideOutput = pipe(literal('123px'), guard(isPixelString));

    expectTypeOf<InferOutput<typeof wideOutput>>().toEqualTypeOf<'123px'>();
  });
});
