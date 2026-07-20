import { describe, expectTypeOf, test } from 'vitest';
import { pipe } from '../../methods/index.ts';
import { number, string, type StringIssue } from '../../schemas/index.ts';
import type {
  BaseIssue,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { guard, type GuardIssue } from '../guard/index.ts';
import {
  brand,
  check,
  checkAsync,
  description,
  email,
  type EmailAction,
  endsWith,
  flavor,
  maxLength,
  maxValue,
  metadata,
  minLength,
  minValue,
  readonly,
  startsWith,
  toNumber,
  transform,
  trim,
  url,
  type UrlAction,
} from '../index.ts';
import type { ValueInput } from '../types.ts';
import { anyOf, type AnyOfAction, type AnyOfIssue } from './anyOf.ts';

describe('anyOf', () => {
  type PixelString = `${number}px`;
  type RemString = `${number}rem`;
  const isPixelString = (input: string): input is PixelString =>
    /^\d+px$/u.test(input);
  const isRemString = (input: string): input is RemString =>
    /^\d+rem$/u.test(input);
  type EmailOption = EmailAction<string, undefined>;
  type UrlOption = UrlAction<string, undefined>;
  type Options = [EmailOption, UrlOption];

  describe('should return action object', () => {
    test('with undefined message', () => {
      expectTypeOf(anyOf([email(), url()])).toEqualTypeOf<
        AnyOfAction<Options, undefined>
      >();
      expectTypeOf(anyOf([email(), url()], undefined)).toEqualTypeOf<
        AnyOfAction<Options, undefined>
      >();
    });

    test('with string message', () => {
      expectTypeOf(anyOf([email(), url()], 'message')).toEqualTypeOf<
        AnyOfAction<Options, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(anyOf([email(), url()], () => 'message')).toEqualTypeOf<
        AnyOfAction<Options, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = AnyOfAction<Options, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        | AnyOfIssue<InferIssue<EmailOption | UrlOption>>
        | InferIssue<EmailOption | UrlOption>
      >();
    });

    test('of subissues', () => {
      expectTypeOf<AnyOfIssue<BaseIssue<unknown>>['issues']>().toEqualTypeOf<
        [BaseIssue<unknown>, ...BaseIssue<unknown>[]]
      >();
    });
  });

  test('should infer correct type in pipe', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(string(), anyOf([email(), url()]));
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<string>();
  });

  test('should infer numeric value options in pipe', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(number(), anyOf([minValue(0), maxValue(10)]));
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<number>();
  });

  test('should infer non-value requirement options in pipe', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const lengthSchema = pipe(string(), anyOf([minLength(1), maxLength(10)]));
    expectTypeOf<InferOutput<typeof lengthSchema>>().toEqualTypeOf<string>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stringSchema = pipe(
      string(),
      anyOf([startsWith('a'), endsWith('z')])
    );
    expectTypeOf<InferOutput<typeof stringSchema>>().toEqualTypeOf<string>();
  });

  test('should infer guard output union in pipe', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(
      string(),
      anyOf([guard(isPixelString), guard(isRemString)])
    );
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<
      PixelString | RemString
    >();
    expectTypeOf<InferIssue<typeof schema>>().toEqualTypeOf<
      | StringIssue
      | AnyOfIssue<
          | GuardIssue<string, typeof isPixelString>
          | GuardIssue<string, typeof isRemString>
        >
      | GuardIssue<string, typeof isPixelString>
      | GuardIssue<string, typeof isRemString>
    >();
  });

  test('should infer input output for mixed validation and guard options', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(string(), anyOf([email(), guard(isPixelString)]));
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<string>();
  });

  test('should reject incompatible inputs', () => {
    pipe(
      string(),
      // @ts-expect-error
      anyOf([email(), check((input: number) => input > 0)])
    );
    pipe(
      number(),
      // @ts-expect-error
      anyOf([email(), url()])
    );
  });

  test('should reject invalid option counts', () => {
    // @ts-expect-error
    anyOf([]);
    // @ts-expect-error
    anyOf([email()]);
  });

  test('should accept transformation options', () => {
    anyOf([email(), toNumber()]);
    anyOf([email(), trim()]);
    anyOf([email(), transform((input: string) => input)]);
    anyOf([email(), brand<string, 'id'>('id')]);
    anyOf([email(), flavor<string, 'id'>('id')]);
    anyOf([email(), readonly<string>()]);
  });

  test('should reject options with unresolved input', () => {
    // `readonly()`/`brand(...)`/`flavor(...)` take no other argument that
    // ties their input to a concrete type, so calling them bare silently
    // defaults their input to `unknown` instead of inferring it from
    // context, corrupting the output union. An explicit type argument (see
    // "should accept transformation options" above) resolves this.
    // @ts-expect-error
    anyOf([email(), brand('id')]);
    // @ts-expect-error
    anyOf([email(), flavor('id')]);
    // @ts-expect-error
    anyOf([email(), readonly()]);
  });

  test('should infer transform output union', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(string(), anyOf([email(), toNumber()]));
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<string | number>();
  });

  test('should correctly narrow input-dependent transforms when explicitly typed', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(string(), anyOf([email(), readonly<string>()]));
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<string>();
  });

  test('should reject async and metadata actions', () => {
    // @ts-expect-error
    anyOf([email(), checkAsync(() => true)]);
    // @ts-expect-error
    anyOf([email(), description('test')]);
    // @ts-expect-error
    anyOf([email(), metadata({ title: 'Test' })]);
  });

  // These lock in the non-obvious inference decisions behind `anyOf`. They exist
  // because the naive alternatives silently break in ways that are easy to
  // reintroduce during a refactor — keep them green.
  describe('type system invariants', () => {
    test('bare value options widen to their base input, never `never`', () => {
      // All options share one input, so `anyOf` intersects the option inputs.
      // A value action's input is the `ValueInput` union, and intersecting a
      // union member-by-member collapses it to `never` — the input inference
      // boxes each option's input before intersecting to avoid exactly that.
      // The bare (out-of-pipe) input must therefore stay `ValueInput` and, in
      // particular, must not collapse to `never`.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const action = anyOf([minValue(0), maxValue(10)]);
      expectTypeOf<InferInput<typeof action>>().toEqualTypeOf<ValueInput>();
      expectTypeOf<InferInput<typeof action>>().not.toEqualTypeOf<never>();
    });

    test('a pipe recovers the precise input type from its upstream schema', () => {
      // Bare input is `ValueInput`, but in a pipe the upstream schema pins it
      // back down via contextual inference — output must be `number`, not
      // `ValueInput`.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const schema = pipe(number(), anyOf([minValue(0), maxValue(10)]));
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<number>();
    });

    test('genuinely incompatible option inputs are rejected', () => {
      // Options with disjoint inputs intersect to `never`, which the pipe
      // rejects — this must not silently pass.
      pipe(
        string(),
        // @ts-expect-error
        anyOf([email(), check((input: number) => input > 0)])
      );
    });

    test('validations keep the input, guards/transforms change the output', () => {
      // The output is the union of every option's output: value-preserving
      // validations contribute the shared input, guards narrow, transforms
      // change the type.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const validations = pipe(string(), anyOf([minLength(1), maxLength(10)]));
      expectTypeOf<InferOutput<typeof validations>>().toEqualTypeOf<string>();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const guards = pipe(
        string(),
        anyOf([guard(isPixelString), guard(isRemString)])
      );
      expectTypeOf<InferOutput<typeof guards>>().toEqualTypeOf<
        PixelString | RemString
      >();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const transforms = pipe(string(), anyOf([email(), toNumber()]));
      expectTypeOf<InferOutput<typeof transforms>>().toEqualTypeOf<
        string | number
      >();
    });
  });
});
