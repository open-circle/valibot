import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  stringifyJson,
  type StringifyJsonAction,
  type StringifyJsonConfig,
  type StringifyJsonIssue,
} from './stringifyJson.ts';

describe('stringifyJson', () => {
  describe('should return action object', () => {
    const config: StringifyJsonConfig = {
      replacer: (key, value) => value,
    };

    test('with undefined config and undefined message', () => {
      type Action = StringifyJsonAction<unknown, undefined, undefined>;
      expectTypeOf(stringifyJson()).toEqualTypeOf<Action>();
      expectTypeOf(stringifyJson(undefined)).toEqualTypeOf<Action>();
      expectTypeOf(stringifyJson(undefined, undefined)).toEqualTypeOf<Action>();
    });

    test('with undefined config and string message', () => {
      expectTypeOf(stringifyJson(undefined, 'message')).toEqualTypeOf<
        StringifyJsonAction<unknown, undefined, 'message'>
      >();
    });

    test('with undefined config and function message', () => {
      expectTypeOf(stringifyJson(undefined, () => 'message')).toEqualTypeOf<
        StringifyJsonAction<unknown, undefined, () => string>
      >();
    });

    test('with config and undefined message', () => {
      type Action = StringifyJsonAction<
        unknown,
        StringifyJsonConfig,
        undefined
      >;
      expectTypeOf(stringifyJson(config)).toEqualTypeOf<Action>();
      expectTypeOf(stringifyJson(config, undefined)).toEqualTypeOf<Action>();
    });

    test('with config and string message', () => {
      expectTypeOf(stringifyJson(config, 'message')).toEqualTypeOf<
        StringifyJsonAction<unknown, StringifyJsonConfig, 'message'>
      >();
    });

    test('with config and function message', () => {
      expectTypeOf(stringifyJson(config, () => 'message')).toEqualTypeOf<
        StringifyJsonAction<unknown, StringifyJsonConfig, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Input = { foo: string };
    type Action = StringifyJsonAction<Input, undefined, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        StringifyJsonIssue<Input>
      >();
    });
  });
});
