import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  btcAddressBech32,
  type BtcAddressBech32Action,
  type BtcAddressBech32Issue,
} from './btcAddressBech32.ts';

describe('btcAddressBech32', () => {
  describe('should return action object', () => {
    const baseAction: Omit<BtcAddressBech32Action<string, never>, 'message'> = {
      kind: 'validation',
      type: 'btc_address_bech32',
      reference: btcAddressBech32,
      expects: null,
      async: false,
      requirement: expect.any(Function),
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: BtcAddressBech32Action<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(btcAddressBech32()).toStrictEqual(action);
      expect(btcAddressBech32(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(btcAddressBech32('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies BtcAddressBech32Action<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(btcAddressBech32(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies BtcAddressBech32Action<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = btcAddressBech32();

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

    test('for Bech32 addresses', () => {
      expectNoActionIssue(action, [
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
        'BC1QALXX0Z89F975UTGN7KYGK49JUSWET08MD9UEET',
        'bc1q6lwh38pw7rspcljf40r3ppmfw2zch5t7v6ekvc',
      ]);
    });

    test('for Bech32m addresses', () => {
      expectNoActionIssue(action, [
        'bc1pk25q77wt6fltgn9ys87mgpp68llxs52mx5alpdl9ydmwxq09w07qywpdur',
        'BC1PK25Q77WT6FLTGN9YS87MGPP68LLXS52MX5ALPDL9YDMWXQ09W07QYWPDUR',
        'tb1p9jveg4j5mh2z3v6e6z93ln5jn4zfehd873ps2vv0g6k234tqw67sm08vk5',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = btcAddressBech32('message');
    const baseIssue: Omit<BtcAddressBech32Issue<string>, 'input' | 'received'> =
      {
        kind: 'validation',
        type: 'btc_address_bech32',
        expected: null,
        message: 'message',
        requirement: expect.any(Function),
      };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid Bech32 addresses', () => {
      expectActionIssue(action, baseIssue, [
        'bc1qalxx0z89f975utgn7kygk49juswet0hmd9ueet',
        'bc1pu4zg8y0zjawf8heauxan82e69dhq9mtsq9lwr3qyzkvf79cpmfmshmrela',
        'bc1QALXX0Z89F975UTGN7KYGK49JUSWET08MD9UEET',
        'bc13qqqqqqqx66tz5',
        'bc1qqqqqqqpxn7fl2',
        'bc1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqepcyyg',
        'bc1qqqqqqqqqqqqqqqqqh2xx79',
        '1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X',
      ]);
    });
  });
});
