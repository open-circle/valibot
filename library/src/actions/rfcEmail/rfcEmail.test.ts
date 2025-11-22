import { describe, expect, test } from 'vitest';
import { RFC_EMAIL_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  rfcEmail,
  type RfcEmailAction,
  type RfcEmailIssue,
} from './rfcEmail.ts';

describe('rfcEmail', () => {
  describe('should return action object', () => {
    const baseAction: Omit<RfcEmailAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'rfc_email',
      reference: rfcEmail,
      expects: null,
      requirement: RFC_EMAIL_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: RfcEmailAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(rfcEmail()).toStrictEqual(action);
      expect(rfcEmail(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(rfcEmail('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies RfcEmailAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(rfcEmail(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies RfcEmailAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = rfcEmail();

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
        action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for simple email', () => {
      expectNoActionIssue(action, ['email@example.com']);
    });

    test('for very short email', () => {
      expectNoActionIssue(action, ['a@b.cd']);
    });

    // Start of local part

    test('for underscore in begining of local part', () => {
      expectNoActionIssue(action, ['_email@example.com']);
    });

    test('for hyphen in begining of local part', () => {
      expectNoActionIssue(action, ['-email@example.com']);
    });

    test('for plus in begining of local part', () => {
      expectNoActionIssue(action, ['+email@example.com']);
    });

    test('for dot in beginning of local part', () => {
      expectNoActionIssue(action, ['.email@example.com']);
    });

    // End of local part

    test('for underscore in end of local part', () => {
      expectNoActionIssue(action, ['email_@example.com']);
    });

    test('for hyphen in end of local part', () => {
      expectNoActionIssue(action, ['email-@example.com']);
    });

    test('for plus in end of local part', () => {
      expectNoActionIssue(action, ['email+@example.com']);
    });

    test('for dot in end of local part', () => {
      expectNoActionIssue(action, ['email.@example.com']);
    });

    // Middle of local part

    test('for dot in local part', () => {
      expectNoActionIssue(action, ['firstname.lastname@example.com']);
    });

    test('for two following dots in local part', () => {
      expectNoActionIssue(action, ['email..email@example.com']);
    });

    test('for underscore in local part', () => {
      expectNoActionIssue(action, ['firstname_lastname@example.com']);
    });

    test('for hyphen in local part', () => {
      expectNoActionIssue(action, ['firstname-lastname@example.com']);
    });

    test('for plus in local part', () => {
      expectNoActionIssue(action, ['firstname+lastname@example.com']);
    });

    // Special local parts

    test('for numerical local part', () => {
      expectNoActionIssue(action, ['1234567890@example.com']);
    });

    test('for underscore local part', () => {
      expectNoActionIssue(action, ['_______@example.com']);
    });

    test('for special chars in local part', () => {
      expectNoActionIssue(action, ['#$&%@example.com']);
    });

    // Domain part variations

    test('for hyphen in domain part', () => {
      expectNoActionIssue(action, ['email@example-domain.com']);
    });

    test('for domain with subdomain', () => {
      expectNoActionIssue(action, ['email@subdomain.example.com']);
    });

    test('for subdomain and hyphen in domain', () => {
      expectNoActionIssue(action, ['email@subdomain.example-domain.com']);
    });

    test('for long top level domain', () => {
      expectNoActionIssue(action, ['email@example.technology']);
    });

    test('for country code TLD', () => {
      expectNoActionIssue(action, ['email@example.co.uk']);
    });

    test('for subdomain and country code TLD', () => {
      expectNoActionIssue(action, ['email@subdomain.example.co.uk']);
    });

    test('for numerical domain', () => {
      expectNoActionIssue(action, ['email@123.com']);
    });

    test('for punycode domain', () => {
      expectNoActionIssue(action, ['email@xn--exmple-cua.com']);
    });

    test('for punycode TLD', () => {
      expectNoActionIssue(action, ['email@example.xn--6frz82g']);
    });

    test('for numerical TLD', () => {
      expectNoActionIssue(action, ['email@example.123']);
    });

    test('for single char TLD', () => {
      expectNoActionIssue(action, ['email@example.a']);
    });

    test('for missing TLD', () => {
      expectNoActionIssue(action, ['email@example']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = rfcEmail('message');
    const baseIssue: Omit<RfcEmailIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'rfc_email',
      expected: null,
      message: 'message',
      requirement: RFC_EMAIL_REGEX,
    };

    // General tests

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for simple strings', () => {
      expectActionIssue(action, baseIssue, ['email', 'emailexamplecom']);
    });

    test('for email with spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' email@example.com',
        'e mail@example.com',
        'email @example.com',
        'email@ example.com',
        'email@exa mple.com',
        'email@example. com',
        'email@example.com ',
      ]);
    });

    // Missing parts

    test('for missing local part', () => {
      expectActionIssue(action, baseIssue, ['@example.com']);
    });

    test('for missing @ symbol', () => {
      expectActionIssue(action, baseIssue, [
        'example.com',
        'email.example.com',
      ]);
    });

    test('for missing domain part', () => {
      expectActionIssue(action, baseIssue, ['email@']);
    });

    test('for missing domain name', () => {
      expectActionIssue(action, baseIssue, ['email@.com']);
    });

    // Invalid repeated chars

    test('for two following @ symbols', () => {
      expectActionIssue(action, baseIssue, ['email@@example.com']);
    });

    test('for dot in end of domain name', () => {
      expectActionIssue(action, baseIssue, ['email@example..com']);
    });

    // Beginning and end of domain part

    test('for underscore in beginning of domain part', () => {
      expectActionIssue(action, baseIssue, ['email@_example.com']);
    });

    test('for hypen in beginning of domain part', () => {
      expectActionIssue(action, baseIssue, ['email@-example.com']);
    });

    test('for plus in beginning of domain part', () => {
      expectActionIssue(action, baseIssue, ['email@+example.com']);
    });

    test('for dot in beginning of domain part', () => {
      expectActionIssue(action, baseIssue, ['email@.example.com']);
    });

    test('for underscore in end of domain name', () => {
      expectActionIssue(action, baseIssue, ['email@example_.com']);
    });

    test('for hypen in end of domain name', () => {
      expectActionIssue(action, baseIssue, ['email@example-.com']);
    });

    test('for plus in end of domain name', () => {
      expectActionIssue(action, baseIssue, ['email@example+.com']);
    });

    // Other special cases

    test('for repeated domain part', () => {
      expectActionIssue(action, baseIssue, ['email@example@example.com']);
    });

    test('for special chars in domain part', () => {
      expectActionIssue(action, baseIssue, [
        'email@#$&%.com',
        'email@example.#$&%',
      ]);
    });

    test('for non ASCII chars', () => {
      expectActionIssue(action, baseIssue, [
        'あいうえお@example.com',
        'email@あいうえお.com',
        'email@example.あいう',
        'Kſ@example.com',
      ]);
    });

    test('for email username', () => {
      expectActionIssue(action, baseIssue, [
        'Joe Smith <email@example.com>',
        'email@example.com (Joe Smith)',
      ]);
    });
  });
});
