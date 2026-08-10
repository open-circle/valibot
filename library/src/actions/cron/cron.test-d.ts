import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { cron, type CronAction, type CronIssue } from './cron.ts';

describe('cron', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = CronAction<string, undefined>;
      expectTypeOf(cron<string>()).toEqualTypeOf<Action>();
      expectTypeOf(cron<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(cron<string, 'message'>('message')).toEqualTypeOf<
        CronAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(cron<string, () => string>(() => 'message')).toEqualTypeOf<
        CronAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = CronAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<CronIssue<string>>();
    });
  });
});
