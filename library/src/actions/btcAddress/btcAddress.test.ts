import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  btcAddress,
  type BTCAddressAction,
  type BTCAddressIssue,
} from './btcAddress.ts';

describe('btcAddresss', () => {
  describe('should return action object', () => {
    const baseAction: Omit<BTCAddressAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'btc_address',
      reference: btcAddress,
      expects: null,
      async: false,
      requirement: expect.any(Function),
      '~validate': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: BTCAddressAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(btcAddress()).toStrictEqual(action);
      expect(btcAddress(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(btcAddress('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies BTCAddressAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(btcAddress(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies BTCAddressAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = btcAddress();

    // General tests

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
        action['~validate']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for bech32 address', () => {
      expectNoActionIssue(action, [
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
        'bc1q6lwh38pw7rspcljf40r3ppmfw2zch5t7v6ekvc',
        'bc1qpwnen0z7rk52nme7nex989ua20w8mjfjdkjys9',
      ]);
    });

    test('for bech32m address', () => {
      expectNoActionIssue(action, [
        'bc1pk25q77wt6fltgn9ys87mgpp68llxs52mx5alpdl9ydmwxq09w07qywpdur',
        'bc1pu4zg8y0zjawf8he2uxan82e69dhq9mtsq9lwr3qyzkvf79cpmfmshmrela',
        'bc1pdwarr8r5rz8khquq2tjl9t8qzdjrq5f40pqvdm0mkv47p8ljm0jsmr4h62',
      ]);
    });

    test('for Base58 address', () => {
      expectNoActionIssue(action, [
        '1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X',
        '3HJ6dgpDGihdQAyLVbZrSSPcqdtC7WZqYh',
        '1EHNa6Q4Jz2uvNExL497mE43ikXhwF6kZm',
      ]);
    });

    test('for testnet bech32m address', () => {
      expectNoActionIssue(action, [
        'tb1p9jveg4j5mh2z3v6e6z93ln5jn4zfehd873ps2vv0g6k234tqw67sm08vk5',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = btcAddress('message');
    const baseIssue: Omit<BTCAddressIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'btc_address',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    // General tests

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for simple strings', () => {
      expectActionIssue(action, baseIssue, [
        '1111111111111111111111111111111111',
        '111111111111111111111111111111111111111111',
        '333333333333333333333333333333333333333333',
        'bc1p11111111111111111111111111111111111111',
        'bc1q11111111111111111111111111111111111111',
      ]);
    });

    test('for random modification address', () => {
      expectActionIssue(action, baseIssue, [
        '1AoW95pvyjaBuSRHYHDRcJXcG5VzRmyi8X',
        'bc1qalxx0z89f975utgn7kygk49juswet0hmd9ueet',
        'bc1pu4zg8y0zjawf8heauxan82e69dhq9mtsq9lwr3qyzkvf79cpmfmshmrela',
      ]);
    });
  });
});
