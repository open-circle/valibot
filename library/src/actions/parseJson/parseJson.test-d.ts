import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  parseJson,
  type ParseJsonAction,
  type ParseJsonConfig,
  type ParseJsonIssue,
} from './parseJson.ts';

describe('parseJson', () => {
  describe('should return action object', () => {
    const config: ParseJsonConfig = {
      reviver: (key, value) => value,
    };

    test('with undefined config and undefined message', () => {
      type Action = ParseJsonAction<string, undefined, undefined>;
      expectTypeOf(parseJson()).toEqualTypeOf<Action>();
      expectTypeOf(parseJson(undefined)).toEqualTypeOf<Action>();
      expectTypeOf(parseJson(undefined, undefined)).toEqualTypeOf<Action>();
    });

    test('with undefined config and string message', () => {
      expectTypeOf(parseJson(undefined, 'message')).toEqualTypeOf<
        ParseJsonAction<string, undefined, 'message'>
      >();
    });

    test('with undefined config and function message', () => {
      expectTypeOf(parseJson(undefined, () => 'message')).toEqualTypeOf<
        ParseJsonAction<string, undefined, () => string>
      >();
    });

    test('with config and undefined message', () => {
      type Action = ParseJsonAction<string, ParseJsonConfig, undefined>;
      expectTypeOf(parseJson(config)).toEqualTypeOf<Action>();
      expectTypeOf(parseJson(config, undefined)).toEqualTypeOf<Action>();
    });

    test('with config and string message', () => {
      expectTypeOf(parseJson(config, 'message')).toEqualTypeOf<
        ParseJsonAction<string, ParseJsonConfig, 'message'>
      >();
    });

    test('with config and function message', () => {
      expectTypeOf(parseJson(config, () => 'message')).toEqualTypeOf<
        ParseJsonAction<string, ParseJsonConfig, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'foo';
    type Action = ParseJsonAction<Input, ParseJsonConfig, 'message'>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toBeUnknown();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<ParseJsonIssue<Input>>();
    });
  });
});
