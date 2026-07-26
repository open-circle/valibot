import { describe, expectTypeOf, test } from 'vitest';
import { check, type CheckIssue } from '../../actions/index.ts';
import type {
  BaseValidationAsync,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { forwardAsync } from './forwardAsync.ts';

describe('forwardAsync', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  type Input = { nested: { key: string }[] };
  type Path = ['nested', 1, 'key'];
  const action = forwardAsync<Input, CheckIssue<Input>, Path>(
    check((input) => Boolean(input), 'message'),
    ['nested', 1, 'key']
  );

  test('should return action object', () => {
    expectTypeOf(action).toEqualTypeOf<
      BaseValidationAsync<Input, Input, CheckIssue<Input>>
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
