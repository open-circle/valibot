import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  creditCard,
  type CreditCardAction,
  type CreditCardIssue,
} from './creditCard.ts';

describe('creditCard', () => {
  describe('should return action object', () => {
    const baseAction: Omit<CreditCardAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'credit_card',
      reference: creditCard,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: CreditCardAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(creditCard()).toStrictEqual(action);
      expect(creditCard(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(creditCard('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies CreditCardAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(creditCard(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies CreditCardAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = creditCard();

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

    test('for American Express', () => {
      expectNoActionIssue(action, ['378282246310005', '371449635398431']);
    });

    test('for Diners Club', () => {
      expectNoActionIssue(action, ['3056930009020004', '36227206271667']);
    });

    test('for Discover', () => {
      expectNoActionIssue(action, [
        '6011111111111117',
        '6011000990139424',
        '6011981111111113',
      ]);
    });

    test('for JCB', () => {
      expectNoActionIssue(action, ['3530111333300000', '3566002020360505']);
    });

    test('for Mastercard', () => {
      expectNoActionIssue(action, [
        '5555555555554444',
        '2223003122003222',
        '5200828282828210',
        '5105105105105100',
      ]);
    });

    test('for UnionPay', () => {
      expectNoActionIssue(action, [
        '6200000000000005',
        '6200000000000047',
        '6205500000000000004',
      ]);
    });

    test('for Visa', () => {
      expectNoActionIssue(action, [
        '4242424242424242',
        '4000056655665556',
        '4007000000027',
      ]);
    });

    test('with space dividers', () => {
      expectNoActionIssue(action, [
        '4000 0025 0000 1001',
        '5555 5525 0000 1001',
      ]);
    });

    test('with dashe dividers', () => {
      expectNoActionIssue(action, [
        '4000-0503-6000-0001',
        '5555-0503-6000-0080',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = creditCard('message');
    const baseIssue: Omit<CreditCardIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'credit_card',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for included letters', () => {
      expectActionIssue(action, baseIssue, [
        'DE6200000000000005',
        '6011000A90139424',
        '37828224631000E',
      ]);
    });

    test('for mixed divider', () => {
      expectActionIssue(action, baseIssue, [
        '40000025 0000-1001',
        '5555-55250000 1001',
        '5555 55555555-4444',
      ]);
    });

    test('for double divider', () => {
      expectActionIssue(action, baseIssue, [
        '4000  0025 0000 1001',
        '5555-0503--6000-0080',
      ]);
    });

    test('for too short numbers', () => {
      expectActionIssue(action, baseIssue, ['3782822463100', '3622720627166']);
    });

    test('for too long numbers', () => {
      expectActionIssue(action, baseIssue, ['62055000000000000040']);
    });

    test('for invalid providers', () => {
      expectActionIssue(action, baseIssue, [
        '7530111333300000',
        '1105105105105100',
        '9000056655665556',
      ]);
    });

    test('for invalid checksum', () => {
      expectActionIssue(action, baseIssue, [
        '5200828282828211',
        '371449635398434',
      ]);
    });
  });
});
