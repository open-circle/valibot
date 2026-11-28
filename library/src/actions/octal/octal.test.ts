import { describe, expect, test } from 'vitest';
import { OCTAL_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { octal, type OctalAction, type OctalIssue } from './octal.ts';

describe('octal', () => {
  describe('should return action object', () => {
    const baseAction: Omit<OctalAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'octal',
      reference: octal,
      expects: null,
      requirement: OCTAL_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: OctalAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(octal()).toStrictEqual(action);
      expect(octal(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(octal('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies OctalAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(octal(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies OctalAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = octal();

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

    test('for octal chars', () => {
      expectNoActionIssue(action, ['0', '1', '2', '3', '4', '5', '6', '7']);
    });

    test('for two chars', () => {
      expectNoActionIssue(action, ['00', '12', '77']);
    });

    test('for multiple chars', () => {
      expectNoActionIssue(action, [
        '000000000000000',
        '777777777777',
        '01234567',
        '1234567',
      ]);
    });

    test('for 0o prefix', () => {
      expectNoActionIssue(action, [
        '0o000000000000000',
        '0o777777777777',
        '0o01234567',
        '0o1234567',
        '0O000000000000000',
        '0O777777777777',
        '0O01234567',
        '0O1234567',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = octal('message');
    const baseIssue: Omit<OctalIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'octal',
      expected: null,
      message: 'message',
      requirement: OCTAL_REGEX,
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

    test('for invalid digits', () => {
      expectActionIssue(action, baseIssue, [
        '8',
        '9',
        '012345678',
        '012384567',
        '901234567',
      ]);
    });

    test('for invalid letters', () => {
      expectActionIssue(action, baseIssue, [
        'a',
        'A',
        'b',
        'B',
        'y',
        'Y',
        'z',
        'Z',
        '012345abc67',
        '012345ABC68789',
        '01234568789abc',
        '012345abc68789ABC',
        'xyz01234568789abc',
        'XYZ012345abc68789',
        '123456789abcdefghijklmnopqrstuvwxyz',
        '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ]);
    });

    test('for only prefix', () => {
      expectActionIssue(action, baseIssue, ['0o', '0O']);
    });

    test('for invalid prefix', () => {
      expectActionIssue(action, baseIssue, [
        '0h01234567',
        '0H01234567',
        '0x01234567',
        '0X01234567',
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
