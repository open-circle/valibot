import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  btcAddress,
  type BtcAddressAction,
  type BtcAddressIssue,
} from './btcAddress.ts';

describe('btcAddress', () => {
  describe('should return action object', () => {
    const baseAction: Omit<BtcAddressAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'btc_address',
      reference: btcAddress,
      expects: null,
      async: false,
      requirement: expect.any(Function),
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: BtcAddressAction<string, undefined> = {
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
      } satisfies BtcAddressAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(btcAddress(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies BtcAddressAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = btcAddress();

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

    test('for Bitcoin addresses', () => {
      expectNoActionIssue(action, [
        '1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X',
        '3HJ6dgpDGihdQAyLVbZrSSPcqdtC7WZqYh',
        'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn',
        '2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br',
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
        'BC1QALXX0Z89F975UTGN7KYGK49JUSWET08MD9UEET',
        'bc1pk25q77wt6fltgn9ys87mgpp68llxs52mx5alpdl9ydmwxq09w07qywpdur',
        'BC1PK25Q77WT6FLTGN9YS87MGPP68LLXS52MX5ALPDL9YDMWXQ09W07QYWPDUR',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = btcAddress('message');
    const baseIssue: Omit<BtcAddressIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'btc_address',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid Bitcoin addresses', () => {
      expectActionIssue(action, baseIssue, [
        '1AoW95pvyjaBuSRHYHDRcJXcG5VzRmyi8X',
        'bc1qalxx0z89f975utgn7kygk49juswet0hmd9ueet',
        'bc1QALXX0Z89F975UTGN7KYGK49JUSWET08MD9UEET',
        'bc13qqqqqqqx66tz5',
        'bc1qqqqqqqpxn7fl2',
        'bc1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqepcyyg',
        'bc1qqqqqqqqqqqqqqqqqh2xx79',
        'QLbz7JHiBTspS962RLKV8GndWFwjA5K66',
      ]);
    });
  });
});
