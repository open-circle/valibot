import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  isoCountryCode,
  type IsoCountryCodeAction,
  type IsoCountryCodeIssue,
} from './isoCountryCode.ts';

describe('isoCountryCode', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsoCountryCodeAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iso_country_code',
      reference: isoCountryCode,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsoCountryCodeAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isoCountryCode()).toStrictEqual(action);
      expect(isoCountryCode(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isoCountryCode('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsoCountryCodeAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isoCountryCode(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsoCountryCodeAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isoCountryCode();

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

    test('for valid ISO3166 country codes', () => {
      expectNoActionIssue(action, [
        'US',
        'USA',
        'JP',
        'JPN',
        'DE',
        'DEU',
        'GB',
        'GBR',
        'FR',
        'FRA',
        'CN',
        'CHN',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isoCountryCode('message');
    const baseIssue: Omit<IsoCountryCodeIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'iso_country_code',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid ISO3166 country codes', () => {
      expectActionIssue(action, baseIssue, [
        'U', // too short
        'USDA', // too long
        'usa', // lowercase
        'us', // lowercase
        'ABC', // not in list (if ABC is valid, I should check. ABC is not in the list I saw.)
        '123', // numbers
        'XX', // invalid alpha-2
        'XXX', // invalid alpha-3
      ]);
    });
  });
});
