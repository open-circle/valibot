import { describe, expect, test } from 'vitest';
import { SLUG_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { slug, type SlugAction, type SlugIssue } from './slug.ts';

describe('slug', () => {
  describe('should return action object', () => {
    const baseAction: Omit<SlugAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'slug',
      reference: slug,
      expects: null,
      requirement: SLUG_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: SlugAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(slug()).toStrictEqual(action);
      expect(slug(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(slug('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies SlugAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(slug(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies SlugAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = slug();

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

    test('for valid single word', () => {
      expectNoActionIssue(action, [
        'a',
        'z',
        '0',
        '9',
        'az',
        '09',
        '120',
        'abc129',
        '968foo',
        'foo135bar',
        '357ace642',
        'collection',
      ]);
    });

    test('for valid separated words', () => {
      expectNoActionIssue(action, [
        'a-a',
        'a_a',
        'z-z',
        'z_z',
        '0-0',
        '0_0',
        '9-9',
        '9_9',
        'az-az',
        'az_az',
        '09-09',
        '09_09',
        '120-120',
        '120_120',
        'abc129-abc129',
        'abc129_abc129',
        '968foo-968foo',
        '968foo_968foo',
        'foo135bar-foo135bar',
        'foo135bar_foo135bar',
        '357ace642-357ace642',
        '357ace642_357ace642',
        'this-that-other-outre-collection',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = slug('message');
    const baseIssue: Omit<SlugIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'slug',
      expected: null,
      message: 'message',
      requirement: SLUG_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for strings with invalid chars', () => {
      expectActionIssue(action, baseIssue, [
        // rfc3986 valid characters
        'A',
        'Z',
        '.',
        '~',
        // rfc3986 reserved characters
        ':',
        '/',
        '?',
        '#',
        '[',
        ']',
        '@',
        '!',
        '$',
        '&',
        "'",
        '(',
        ')',
        '*',
        '+',
        ',',
        ';',
        '=',
        // characters that occupy more than one byte
        'é',
        '❤️',
        // URL-encoded
        '%40', // '@'
        '%20', // ' '
        '%2F%C3%A9', // 'é'
        // strings containing at least one invalid character
        'helloWorld',
        'café',
        // regex specific tests
        'a-A',
        'a-Z',
        'a-.',
        'a-~',
        'a-:',
        'a-/',
        'a-?',
        'a-#',
        'a-[',
        'a-]',
        'a-@',
        'a-!',
        'a-$',
        'a-&',
        "a-'",
        'a-(',
        'a-)',
        'a-*',
        'a-+',
        'a-,',
        'a-;',
        'a-=',
        'a-é',
        'a-❤️',
        'a-%40',
        'a-%20',
        'a-%2F%C3%A9',
      ]);
    });

    test('for invalid separators', () => {
      expectActionIssue(action, baseIssue, [
        'hello world',
        'hello+world',
        'hello%20world',
        // consecutive valid separator characters
        'hello--world',
        'hello__world',
        'hello-_world',
        'hello_-world',
      ]);
    });

    test('for separators at start or end', () => {
      expectActionIssue(action, baseIssue, [
        '-hello',
        '_hello',
        '-123',
        '_123',
        'hello-',
        'hello_',
        '123-',
        '123_',
        '-hello-',
        '_hello_',
      ]);
    });
  });
});
