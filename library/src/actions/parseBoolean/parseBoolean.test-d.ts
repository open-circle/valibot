import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  parseBoolean,
  type ParseBooleanAction,
  type ParseBooleanConfig,
  type ParseBooleanIssue,
} from './parseBoolean.ts';

describe('parseBoolean', () => {
  describe('should return action object', () => {
    const config: ParseBooleanConfig = {
      truthy: ['yep'],
      falsy: ['nope'],
    };

    test('with undefined config and undefined message', () => {
      type Action = ParseBooleanAction<unknown, undefined, undefined>;
      expectTypeOf(parseBoolean()).toEqualTypeOf<Action>();
      expectTypeOf(parseBoolean(undefined)).toEqualTypeOf<Action>();
      expectTypeOf(parseBoolean(undefined, undefined)).toEqualTypeOf<Action>();
    });

    test('with undefined config and string message', () => {
      expectTypeOf(parseBoolean(undefined, 'message')).toEqualTypeOf<
        ParseBooleanAction<unknown, undefined, 'message'>
      >();
    });

    test('with undefined config and function message', () => {
      expectTypeOf(parseBoolean(undefined, () => 'message')).toEqualTypeOf<
        ParseBooleanAction<unknown, undefined, () => string>
      >();
    });

    test('with config and undefined message', () => {
      type Action = ParseBooleanAction<unknown, ParseBooleanConfig, undefined>;
      expectTypeOf(parseBoolean(config)).toEqualTypeOf<Action>();
      expectTypeOf(parseBoolean(config, undefined)).toEqualTypeOf<Action>();
    });

    test('with config and string message', () => {
      expectTypeOf(parseBoolean(config, 'message')).toEqualTypeOf<
        ParseBooleanAction<unknown, ParseBooleanConfig, 'message'>
      >();
    });

    test('with config and function message', () => {
      expectTypeOf(parseBoolean(config, () => 'message')).toEqualTypeOf<
        ParseBooleanAction<unknown, ParseBooleanConfig, () => string>
      >();
    });

    test('with mixed-type config', () => {
      const mixedConfig: ParseBooleanConfig = {
        truthy: [1, true, 'yes'],
        falsy: [0, false, null],
      };
      type Action = ParseBooleanAction<unknown, ParseBooleanConfig, undefined>;
      expectTypeOf(parseBoolean(mixedConfig)).toEqualTypeOf<Action>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'foo';
    type Action = ParseBooleanAction<Input, ParseBooleanConfig, 'message'>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<boolean>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        ParseBooleanIssue<Input>
      >();
    });
  });
});
