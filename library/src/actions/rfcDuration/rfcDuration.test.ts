import { describe, expect, test } from 'vitest';
import { RFC_3339_DURATION_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue } from '../../vitest/expectActionIssue.ts';
import { expectNoActionIssue } from '../../vitest/expectNoActionIssue.ts';
import {
  rfcDuration,
  type RfcDurationAction,
  type RfcDurationIssue,
} from './rfcDuration.ts';

describe('rfcDuration', () => {
  describe('should return action object', () => {
    const baseAction: Omit<RfcDurationAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'rfc_duration',
      reference: rfcDuration,
      expects: null,
      requirement: RFC_3339_DURATION_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: RfcDurationAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(rfcDuration()).toStrictEqual(action);
      expect(rfcDuration(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(rfcDuration('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies RfcDurationAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(rfcDuration(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies RfcDurationAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = rfcDuration();

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

    test('for valid RFC 3339 durations', () => {
      expectNoActionIssue(action, [
        'P1D',
        'PT5H30M',
        'P1Y2M3DT4H5M6S',
        'PT0S',
        'P1W',
        'P1Y',
        'PT5H',
        'P1DT2H',
        'P10Y2M',
        'P3DT4H5M6S',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = rfcDuration('message');
    const baseIssue: Omit<RfcDurationIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'rfc_duration',
      expected: null,
      message: 'message',
      requirement: RFC_3339_DURATION_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for missing designator', () => {
      expectActionIssue(action, baseIssue, ['P', 'PT']);
    });

    test('for missing prefix', () => {
      expectActionIssue(action, baseIssue, ['1Y', '1D', 'T5H']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [' P1D', 'P1D ', 'P 1D']);
    });

    test('for time parts outside the T section', () => {
      expectActionIssue(action, baseIssue, ['P1H', 'P5S', 'P1Y2M3D4H']);
    });

    test('for wrong component order', () => {
      expectActionIssue(action, baseIssue, ['P1D2M', 'PT5M30H', 'P1M2Y']);
    });

    test('for combined week form', () => {
      expectActionIssue(action, baseIssue, ['P1WT5H', 'P1Y2W']);
    });

    test('for fractional values', () => {
      expectActionIssue(action, baseIssue, ['P1.5Y', 'PT1.5S', 'PT0.5H']);
    });

    test('for negative values', () => {
      expectActionIssue(action, baseIssue, ['P-1D', 'PT-5H']);
    });
  });
});
