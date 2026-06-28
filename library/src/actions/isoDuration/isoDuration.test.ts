import { describe, expect, test } from 'vitest';
import { ISO_DURATION_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import {
  isoDuration,
  type IsoDurationAction,
  type IsoDurationIssue,
} from './isoDuration.ts';

describe('isoDuration', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsoDurationAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iso_duration',
      reference: isoDuration,
      expects: null,
      requirement: ISO_DURATION_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsoDurationAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isoDuration()).toStrictEqual(action);
      expect(isoDuration(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isoDuration('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsoDurationAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isoDuration(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsoDurationAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isoDuration();

    test('for untyped inputs', () => {
      const issues: [StringIssue] = [
        {
          kind: 'schema',
          type: 'string',
          input: null,
          expected: 'string',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid ISO durations', () => {
      expectNoActionIssue(action, [
        'P1D',
        'P1M',
        'P1Y',
        'P1W',
        'P3DT4H',
        'PT6S',
        'PT1M',
        'PT5H30M',
        'P1Y2M3DT4H5M6S',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoDuration('message');
    const baseIssue: Omit<IsoDurationIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'iso_duration',
      expected: null,
      message: 'message',
      requirement: ISO_DURATION_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [' P1D', 'P1D ', ' P1D ']);
    });

    test('for missing designator', () => {
      expectActionIssue(action, baseIssue, ['1Y', '5H', 'T5H']);
    });

    test('for empty parts', () => {
      expectActionIssue(action, baseIssue, ['P', 'PT', 'P1DT']);
    });

    test('for wrong order', () => {
      expectActionIssue(action, baseIssue, ['P2M1Y', 'P1D2M', 'PT5M3H']);
    });

    test('for mixed week', () => {
      expectActionIssue(action, baseIssue, ['P1W2D', 'P1Y1W', 'P1WT1H']);
    });

    test('for lowercase units', () => {
      expectActionIssue(action, baseIssue, ['p1d', 'P1y', 'pt5h']);
    });

    test('for fractional values', () => {
      expectActionIssue(action, baseIssue, [
        'P0.5Y',
        'PT0.5S',
        'PT1.5H',
        'P0,5Y',
      ]);
    });

    test('for invalid characters', () => {
      expectActionIssue(action, baseIssue, ['P1X', 'P-1Y', 'P1.5']);
    });
  });
});
