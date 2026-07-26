import { describe, expectTypeOf, test } from 'vitest';
import { check, type CheckIssue } from '../../actions/index.ts';
import type {
  BaseValidation,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { forward } from './forward.ts';

describe('forward', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  type Input = { nested: { key: string }[] };
  type Path = ['nested', 1, 'key'];
  const action = forward<Input, CheckIssue<Input>, Path>(
    check((input) => Boolean(input), 'message'),
    ['nested', 1, 'key']
  );

  test('should return action object', () => {
    expectTypeOf(action).toEqualTypeOf<
      BaseValidation<Input, Input, CheckIssue<Input>>
    >();
  });

  describe('should infer correct types', () => {
    type Action = typeof action;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<CheckIssue<Input>>();
    });
  });
});
