import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  isoCurrencyCode,
  type IsoCurrencyCodeAction,
  type IsoCurrencyCodeIssue,
} from './isoCurrencyCode.ts';

describe('isoCurrencyCode', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsoCurrencyCodeAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iso_currency_code',
      reference: isoCurrencyCode,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsoCurrencyCodeAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isoCurrencyCode()).toStrictEqual(action);
      expect(isoCurrencyCode(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isoCurrencyCode('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsoCurrencyCodeAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isoCurrencyCode(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsoCurrencyCodeAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isoCurrencyCode();

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

    test('for valid ISO 4217 currency codes', () => {
      expectNoActionIssue(action, ['USD', 'JPY', 'EUR', 'GBP', 'CAD', 'AUD']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoCurrencyCode('message');
    const baseIssue: Omit<
      IsoCurrencyCodeIssue<string>,
      'input' | 'received'
    > = {
      kind: 'validation',
      type: 'iso_currency_code',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid ISO 4217 currency codes', () => {
      expectActionIssue(action, baseIssue, [
        'US', // too short
        'USDA', // too long
        'usd', // lowercase
        'ABC', // not in list
        '123', // numbers
      ]);
    });
  });
});
