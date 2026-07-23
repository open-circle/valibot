import { describe, expect, test } from 'vitest';
import { ISO_DURATION_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import {
  isoDuration,
  type IsoDurationIssue as IsoDuration,
  type IsoDurationAction,
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

    test('for single date components', () => {
      expectNoActionIssue(action, ['P1Y', 'P2M', 'P0D', 'P1D']);
    });

    test('for combined date components', () => {
      expectNoActionIssue(action, ['P1Y2M', 'P1Y2M3D', 'P2M3D']);
    });

    test('for week durations', () => {
      expectNoActionIssue(action, ['P1W', 'P4W', 'P52W']);
    });

    test('for single time components', () => {
      expectNoActionIssue(action, ['PT5H', 'PT30M', 'PT1S', 'PT0S']);
    });

    test('for combined time components', () => {
      expectNoActionIssue(action, ['PT5H30M', 'PT4H5M6S', 'PT30M15S']);
    });

    test('for combined date and time components', () => {
      expectNoActionIssue(action, [
        'P1DT5H',
        'P1Y2M3DT4H5M6S',
        'P1YT1S',
        'P0DT0S',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoDuration('message');
    const baseIssue: Omit<IsoDuration<string>, 'input' | 'received'> = {
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
      expectActionIssue(action, baseIssue, ['1Y', '1D', '1W', 'T1S']);
    });

    test('for missing components', () => {
      expectActionIssue(action, baseIssue, ['P', 'PT']);
    });

    test('for time components without designator', () => {
      expectActionIssue(action, baseIssue, ['P1S', 'P1H', 'P5H30M']);
    });

    test('for wrong component order', () => {
      expectActionIssue(action, baseIssue, [
        'P1Y2D3M',
        'P1D2M',
        'PT1S5H',
        'PT6S4H',
      ]);
    });

    test('for week combined with other components', () => {
      expectActionIssue(action, baseIssue, ['P1W2D', 'P1Y1W', 'P4WT1S']);
    });

    test('for negative components', () => {
      expectActionIssue(action, baseIssue, ['P-1D', 'PT-1S', 'P-1Y2M']);
    });

    test('for fractional components', () => {
      expectActionIssue(action, baseIssue, ['P1.5D', 'PT0.5S', 'P1,5D']);
    });

    test('for invalid characters', () => {
      expectActionIssue(action, baseIssue, ['Pjunk', 'P1X', 'PT1Z', 'p1d']);
    });
  });
});
