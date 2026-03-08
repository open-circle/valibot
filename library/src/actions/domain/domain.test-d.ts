import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { domain, type DomainAction, type DomainIssue } from './domain.ts';

describe('domain', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = DomainAction<string, undefined>;
      expectTypeOf(domain()).toEqualTypeOf<Action>();
      expectTypeOf(domain(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(domain('message')).toEqualTypeOf<
        DomainAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(domain(() => 'message')).toEqualTypeOf<
        DomainAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = DomainAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<DomainIssue<string>>();
    });
  });
});
