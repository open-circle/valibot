import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  btcAddressBase58,
  type BtcAddressBase58Action,
  type BtcAddressBase58Issue,
} from './btcAddressBase58.ts';

describe('btcAddressBase58', () => {
  describe('should return action object', () => {
    const baseAction: Omit<BtcAddressBase58Action<string, never>, 'message'> = {
      kind: 'validation',
      type: 'btc_address_base58',
      reference: btcAddressBase58,
      expects: null,
      async: false,
      requirement: expect.any(Function),
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: BtcAddressBase58Action<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(btcAddressBase58()).toStrictEqual(action);
      expect(btcAddressBase58(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(btcAddressBase58('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies BtcAddressBase58Action<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(btcAddressBase58(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies BtcAddressBase58Action<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = btcAddressBase58();

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

    test('for Base58 addresses', () => {
      expectNoActionIssue(action, [
        '1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X',
        '3HJ6dgpDGihdQAyLVbZrSSPcqdtC7WZqYh',
        '1EHNa6Q4Jz2uvNExL497mE43ikXhwF6kZm',
        'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn',
        'n2eMqTT929pb1RDNuqEnxdaLau1rxy3efi',
        '2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = btcAddressBase58('message');
    const baseIssue: Omit<BtcAddressBase58Issue<string>, 'input' | 'received'> =
      {
        kind: 'validation',
        type: 'btc_address_base58',
        expected: null,
        message: 'message',
        requirement: expect.any(Function),
      };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid Base58 addresses', () => {
      expectActionIssue(action, baseIssue, [
        '1AoW95pvyjaBuSRHYHDRcJXcG5VzRmyi8X',
        '1111111111111111111111111111111111',
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
      ]);
    });
  });
});
