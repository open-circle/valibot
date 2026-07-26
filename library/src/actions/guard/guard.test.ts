import { describe, expect, test } from 'vitest';
import type { FailureDataset } from '../../types/dataset.ts';
import type { GuardAction, GuardIssue } from './guard.ts';
import { guard } from './guard.ts';

describe('guard', () => {
  type PixelString = `${number}px`;
  const isPixelString = (input: string): input is PixelString =>
    /^\d+px$/u.test(input);

  const baseAction: Omit<
    GuardAction<string, typeof isPixelString, undefined>,
    'message'
  > = {
    kind: 'transformation',
    type: 'guard',
    reference: guard,
    requirement: isPixelString,
    async: false,
    '~run': expect.any(Function),
  };

  describe('should return action object', () => {
    test('with undefined message', () => {
      const action: GuardAction<string, typeof isPixelString, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(guard(isPixelString)).toStrictEqual(action);
      expect(guard(isPixelString, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      const action: GuardAction<string, typeof isPixelString, 'message'> = {
        ...baseAction,
        message: 'message',
      };
      expect(guard(isPixelString, 'message')).toStrictEqual(action);
    });

    test('with function message', () => {
      const message = () => 'message';
      const action: GuardAction<string, typeof isPixelString, typeof message> =
        {
          ...baseAction,
          message,
        };
      expect(guard(isPixelString, message)).toStrictEqual(action);
    });
  });

  test('should return dataset without issues', () => {
    const action = guard(isPixelString);
    const outputDataset = { typed: true, value: '123px' };
    expect(action['~run']({ typed: true, value: '123px' }, {})).toStrictEqual(
      outputDataset
    );
  });

  test('should return dataset with issues', () => {
    const action = guard(isPixelString, 'message');
    const baseIssue: Omit<
      GuardIssue<string, typeof isPixelString>,
      'input' | 'received'
    > = {
      kind: 'transformation',
      type: 'guard',
      expected: null,
      message: 'message',
      requirement: isPixelString,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    expect(action['~run']({ typed: true, value: '123' }, {})).toStrictEqual({
      typed: false,
      value: '123',
      issues: [
        {
          ...baseIssue,
          input: '123',
          received: '"123"',
        },
      ],
    } satisfies FailureDataset<GuardIssue<string, typeof isPixelString>>);
  });
});
