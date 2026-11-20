import { describe, expect, test } from 'vitest';
import { HEXADECIMAL_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  hexadecimal,
  type HexadecimalAction,
  type HexadecimalIssue,
} from './hexadecimal.ts';

describe('hexadecimal', () => {
  describe('should return action object', () => {
    const baseAction: Omit<HexadecimalAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'hexadecimal',
      reference: hexadecimal,
      expects: null,
      requirement: HEXADECIMAL_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: HexadecimalAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(hexadecimal()).toStrictEqual(action);
      expect(hexadecimal(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(hexadecimal('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies HexadecimalAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(hexadecimal(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies HexadecimalAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = hexadecimal();

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

    test('for hexadecimal chars', () => {
      expectNoActionIssue(action, [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
      ]);
    });

    test('for two chars', () => {
      expectNoActionIssue(action, ['00', '12', 'FF']);
    });

    test('for multiple chars', () => {
      expectNoActionIssue(action, [
        '000000000000000',
        '123456789abcdef',
        '123456789ABCDEF',
        'FFFFFFFFFFFFFFF',
      ]);
    });

    test('for 0h prefix', () => {
      expectNoActionIssue(action, [
        '0h000000000000000',
        '0h123456789abcdef',
        '0h123456789ABCDEF',
        '0hFFFFFFFFFFFFFFF',
        '0H000000000000000',
        '0H123456789abcdef',
        '0H123456789ABCDEF',
        '0HFFFFFFFFFFFFFFF',
      ]);
    });

    test('for 0x prefix', () => {
      expectNoActionIssue(action, [
        '0x000000000000000',
        '0x123456789abcdef',
        '0x123456789ABCDEF',
        '0xFFFFFFFFFFFFFFF',
        '0X000000000000000',
        '0X123456789abcdef',
        '0X123456789ABCDEF',
        '0XFFFFFFFFFFFFFFF',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = hexadecimal('message');
    const baseIssue: Omit<HexadecimalIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'hexadecimal',
      expected: null,
      message: 'message',
      requirement: HEXADECIMAL_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [' 1', '1 ', ' 1 ', '1 2']);
    });

    test('for number signs', () => {
      expectActionIssue(action, baseIssue, ['+1', '-1', '+123', '-123']);
    });

    test('for float numbers', () => {
      expectActionIssue(action, baseIssue, ['0.1', '123.456']);
    });

    test('for exponential numbers', () => {
      expectActionIssue(action, baseIssue, ['1e-3', '1e+3']);
    });

    test('for invalid letters', () => {
      expectActionIssue(action, baseIssue, [
        'g',
        'G',
        'z',
        'Z',
        '123456789abcdefg',
        '123456789ABCDEFG',
        '123456789abcdefghijklmnopqrstuvwxyz',
        '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ]);
    });

    test('for special chars', () => {
      expectActionIssue(action, baseIssue, [
        '-',
        '-1',
        '+',
        '+1',
        '#',
        '#1',
        '$',
        '$1',
        '%',
        '1%',
      ]);
    });
  });
});
