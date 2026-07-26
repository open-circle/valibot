import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  type PartialCheckActionAsync,
  partialCheckAsync,
} from './partialCheckAsync.ts';
import type { DeepPickN, PartialCheckIssue } from './types.ts';

describe('partialCheckAsync', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  type Input = { nested: { key1: number; key2: string; key3: boolean } };
  const paths = [['nested', 'key2']] as const;
  type PathList = typeof paths;
  type Selection = DeepPickN<Input, PathList>;
  const requirement = async (input: Selection) =>
    input.nested.key2.includes('foo');

  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = PartialCheckActionAsync<
        Input,
        PathList,
        Selection,
        undefined
      >;
      expectTypeOf(
        partialCheckAsync<Input, PathList, Selection>(paths, requirement)
      ).toEqualTypeOf<Action>();
      expectTypeOf(
        partialCheckAsync<Input, PathList, Selection, undefined>(
          paths,
          requirement,
          undefined
        )
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        partialCheckAsync<Input, PathList, Selection, 'message'>(
          paths,
          requirement,
          'message'
        )
      ).toEqualTypeOf<
        PartialCheckActionAsync<Input, PathList, Selection, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        partialCheckAsync<Input, PathList, Selection, () => string>(
          paths,
          requirement,
          () => 'message'
        )
      ).toEqualTypeOf<
        PartialCheckActionAsync<Input, PathList, Selection, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = PartialCheckActionAsync<
      Input,
      PathList,
      Selection,
      undefined
    >;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        PartialCheckIssue<Selection>
      >();
    });
  });
});
