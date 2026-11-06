import { describe, expect, test } from 'vitest';
import { BASE64_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { base64, type Base64Action, type Base64Issue } from './base64.ts';

describe('base64', () => {
  describe('should return action object', () => {
    const baseAction: Omit<Base64Action<string, never>, 'message'> = {
      kind: 'validation',
      type: 'base64',
      reference: base64,
      expects: null,
      requirement: BASE64_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: Base64Action<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(base64()).toStrictEqual(action);
      expect(base64(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(base64('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies Base64Action<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(base64(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies Base64Action<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = base64();

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

    test('for empty string', () => {
      expectNoActionIssue(action, ['']);
    });

    test('for Base64 strings', () => {
      expectNoActionIssue(action, [
        // Test vectors from https://datatracker.ietf.org/doc/html/rfc4648#section-10
        '', // ''
        'Zg==', // 'f'
        'Zm8=', // 'fo'
        'Zm9v', // 'foo'
        'Zm9vYg==', // 'foob'
        'Zm9vYmE=', // 'fooba'
        'Zm9vYmFy', // 'foobar'

        // Other custom tests
        'dmFsaWJvdA==', // 'valibot'
        'SGVsbG8sIEkgYW0gVmFsaWJvdCBhbmQgSSB3b3VsZCBsaWtlIHRvIGhlbHAgeW91IHZhbGlkYXRlIGRhdGEgZWFzaWx5IHVzaW5nIGEgc2NoZW1hLg==', // 'Hello, I am Valibot and I would like to help you validate data easily using a schema.'
        '8J+Mrg==', // '🌮'
      ]);
    });

    test('for long Base64 strings', () => {
      expectNoActionIssue(action, ['Zm9v'.repeat(2_500_000)]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = base64('message');
    const baseIssue: Omit<Base64Issue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'base64',
      expected: null,
      message: 'message',
      requirement: BASE64_REGEX,
    };

    test('for blank strings', () => {
      expectActionIssue(action, baseIssue, [' ', '\n']);
    });

    test('for invalid chars', () => {
      expectActionIssue(action, baseIssue, [
        'foo`', // `
        'foo~', // ~
        'foo!', // !
        'foo@', // @
        'foo#', // #
        'foo$', // $
        'foo%', // %
        'foo^', // ^
        'foo&', // &
        'foo*', // *
        'foo(', // (
        'foo)', // )
        'foo-', // -
        'foo_', // _
        'foo[', // [
        'foo]', // ]
        'foo{', // {
        'foo}', // }
        'foo\\', // \
        'foo|', // |
        'foo;', // ;
        'foo:', // :
        "foo'", // '
        'foo"', // "
        'foo,', // ,
        'foo.', // .
        'foo<', // <
        'foo>', // >
        'foo?', // ?
      ]);
    });

    test('for invalid padding', () => {
      expectActionIssue(action, baseIssue, [
        'dmFsaWJvdA', // == missing
        'dmFsaWJvdA=', // = missing
        'dmFsaWJvdA===', // = extra
        'Zm9vYmE', // = missing
        'Zm9vYmE==', // = extra
      ]);
    });

    test('for long invalid Base64 strings', () => {
      expectActionIssue(action, baseIssue, [`${'Zm9v'.repeat(2_500_000)}Zm9!`]);
    });
  });
});
