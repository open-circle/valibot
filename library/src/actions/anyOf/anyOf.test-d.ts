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
    pipe(
      number(),
      // @ts-expect-error
      anyOf([minValue(0), maxValue('10')])
    );
  });

  test('should reject invalid option counts', () => {
    // @ts-expect-error
    anyOf([]);
    // @ts-expect-error
    anyOf([email()]);
  });

  test('should reject always-success transformations', () => {
    // @ts-expect-error
    anyOf([email(), brand('id')]);
    // @ts-expect-error
    anyOf([email(), flavor('id')]);
    // @ts-expect-error
    anyOf([email(), readonly()]);
  });

  test('should reject type-changing and value-changing transformations', () => {
    // @ts-expect-error
    anyOf([email(), toNumber()]);
    // @ts-expect-error
    anyOf([email(), trim()]);
    // @ts-expect-error
    anyOf([email(), transform((input: string) => input)]);
  });

  test('should reject async and metadata actions', () => {
    // @ts-expect-error
    anyOf([email(), checkAsync(() => true)]);
    // @ts-expect-error
    anyOf([email(), description('test')]);
    // @ts-expect-error
    anyOf([email(), metadata({ title: 'Test' })]);
  });
});
