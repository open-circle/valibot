import { describe, expect, test } from 'vitest';
import { _formatCase } from './_formatCase.ts';

describe('_formatCase', () => {
  describe('should format as camel case', () => {
    const camel = (input: string) => _formatCase(input, '', false, true);

    test('for empty string', () => {
      expect(camel('')).toBe('');
    });

    test('for single word', () => {
      expect(camel('hello')).toBe('hello');
      expect(camel('Hello')).toBe('hello');
      expect(camel('HELLO')).toBe('hello');
    });

    test('for snake_case input', () => {
      expect(camel('hello_world')).toBe('helloWorld');
      expect(camel('foo_bar_baz')).toBe('fooBarBaz');
    });

    test('for kebab-case input', () => {
      expect(camel('hello-world')).toBe('helloWorld');
    });

    test('for SCREAMING_SNAKE_CASE input', () => {
      expect(camel('HELLO_WORLD')).toBe('helloWorld');
    });

    test('for camelCase input (idempotent)', () => {
      expect(camel('helloWorld')).toBe('helloWorld');
    });

    test('for PascalCase input', () => {
      expect(camel('HelloWorld')).toBe('helloWorld');
    });

    test('for acronym run', () => {
      expect(camel('parseURLValue')).toBe('parseUrlValue');
      expect(camel('XMLHttpRequest')).toBe('xmlHttpRequest');
      expect(camel('URLParser')).toBe('urlParser');
      expect(camel('getURL')).toBe('getUrl');
      expect(camel('IOError')).toBe('ioError');
      expect(camel('iPhone')).toBe('iPhone');
    });

    test('for digit boundary', () => {
      expect(camel('item2Name')).toBe('item2Name');
      expect(camel('Item2Name')).toBe('item2Name');
      expect(camel('Foo2Bar')).toBe('foo2Bar');
      expect(camel('HTTP2')).toBe('http2');
      expect(camel('OAuth2Token')).toBe('oAuth2Token');
    });
  });

  describe('should format as pascal case', () => {
    const pascal = (input: string) => _formatCase(input, '', true, true);

    test('for empty string', () => {
      expect(pascal('')).toBe('');
    });

    test('for single word', () => {
      expect(pascal('hello')).toBe('Hello');
      expect(pascal('HELLO')).toBe('Hello');
    });

    test('for snake_case input', () => {
      expect(pascal('hello_world')).toBe('HelloWorld');
    });

    test('for camelCase input', () => {
      expect(pascal('helloWorld')).toBe('HelloWorld');
    });

    test('for PascalCase input (idempotent)', () => {
      expect(pascal('HelloWorld')).toBe('HelloWorld');
    });

    test('for acronym run', () => {
      expect(pascal('parseURLValue')).toBe('ParseUrlValue');
      expect(pascal('XMLHttpRequest')).toBe('XmlHttpRequest');
      expect(pascal('URLParser')).toBe('UrlParser');
    });

    test('for digit boundary', () => {
      expect(pascal('item2Name')).toBe('Item2Name');
      expect(pascal('Foo2Bar')).toBe('Foo2Bar');
    });
  });

  describe('should format as snake case', () => {
    const snake = (input: string) => _formatCase(input, '_', false, false);

    test('for empty string', () => {
      expect(snake('')).toBe('');
    });

    test('for single word', () => {
      expect(snake('hello')).toBe('hello');
      expect(snake('HELLO')).toBe('hello');
    });

    test('for camelCase input', () => {
      expect(snake('helloWorld')).toBe('hello_world');
    });

    test('for PascalCase input', () => {
      expect(snake('HelloWorld')).toBe('hello_world');
    });

    test('for snake_case input (idempotent)', () => {
      expect(snake('hello_world')).toBe('hello_world');
    });

    test('for acronym run', () => {
      expect(snake('parseURLValue')).toBe('parse_url_value');
      expect(snake('XMLHttpRequest')).toBe('xml_http_request');
      expect(snake('IOError')).toBe('io_error');
      expect(snake('iPhone')).toBe('i_phone');
    });

    test('for digit boundary', () => {
      expect(snake('item2Name')).toBe('item2_name');
      expect(snake('OAuth2Token')).toBe('o_auth2_token');
    });
  });

  describe('should format as kebab case', () => {
    const kebab = (input: string) => _formatCase(input, '-', false, false);

    test('for empty string', () => {
      expect(kebab('')).toBe('');
    });

    test('for camelCase input', () => {
      expect(kebab('helloWorld')).toBe('hello-world');
    });

    test('for snake_case input', () => {
      expect(kebab('hello_world')).toBe('hello-world');
    });

    test('for kebab-case input (idempotent)', () => {
      expect(kebab('hello-world')).toBe('hello-world');
    });

    test('for acronym run', () => {
      expect(kebab('parseURLValue')).toBe('parse-url-value');
    });
  });

  describe('with custom parameter combinations', () => {
    test('should produce all-lowercase concat when no caps and no separator', () => {
      expect(_formatCase('helloWorld', '', false, false)).toBe('helloworld');
      expect(_formatCase('XMLHttpRequest', '', false, false)).toBe(
        'xmlhttprequest'
      );
    });

    test('should produce Pascal_Snake when separator and both caps set', () => {
      expect(_formatCase('helloWorld', '_', true, true)).toBe('Hello_World');
      expect(_formatCase('foo bar baz', '_', true, true)).toBe('Foo_Bar_Baz');
    });

    test('should capitalize only first word when capRest is false', () => {
      expect(_formatCase('helloWorldFoo', '', true, false)).toBe(
        'Helloworldfoo'
      );
      expect(_formatCase('helloWorldFoo', '_', true, false)).toBe(
        'Hello_world_foo'
      );
    });

    test('should support multi-char separator', () => {
      expect(_formatCase('helloWorld', '::', false, false)).toBe(
        'hello::world'
      );
      expect(_formatCase('helloWorld', ' - ', false, false)).toBe(
        'hello - world'
      );
    });

    test('should support custom separator with caps', () => {
      expect(_formatCase('helloWorld', '.', false, true)).toBe('hello.World');
      expect(_formatCase('hello_world', '/', true, true)).toBe('Hello/World');
    });
  });

  describe('with edge cases', () => {
    test('should return empty string for separator-only input', () => {
      expect(_formatCase('___', '', false, true)).toBe('');
      expect(_formatCase('---', '_', false, false)).toBe('');
      expect(_formatCase('   ', '-', false, false)).toBe('');
      expect(_formatCase('\t\n\r\v\f', '_', false, false)).toBe('');
    });

    test('should collapse consecutive separators', () => {
      expect(_formatCase('foo__bar', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('foo  bar', '-', false, false)).toBe('foo-bar');
      expect(_formatCase('foo--bar', '_', false, false)).toBe('foo_bar');
    });

    test('should strip leading and trailing separators', () => {
      expect(_formatCase('__foo_bar__', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('--foo-bar--', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('  foo bar  ', '-', false, false)).toBe('foo-bar');
    });

    test('should handle mixed separator types', () => {
      expect(_formatCase('foo_bar-baz qux', '-', false, false)).toBe(
        'foo-bar-baz-qux'
      );
      expect(
        _formatCase('mixedCASE_with-various separators', '_', false, false)
      ).toBe('mixed_case_with_various_separators');
    });

    test('should treat all ASCII whitespace as separators', () => {
      expect(_formatCase('foo bar', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('foo\tbar', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('foo\nbar', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('foo\rbar', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('foo\fbar', '_', false, false)).toBe('foo_bar');
      expect(_formatCase('foo\vbar', '_', false, false)).toBe('foo_bar');
    });

    test('should handle single-char input', () => {
      expect(_formatCase('a', '_', false, false)).toBe('a');
      expect(_formatCase('A', '_', false, false)).toBe('a');
      expect(_formatCase('1', '_', false, false)).toBe('1');
      expect(_formatCase('_', '_', false, false)).toBe('');
    });

    test('should keep all-uppercase as single word', () => {
      expect(_formatCase('A', '', false, true)).toBe('a');
      expect(_formatCase('AB', '_', false, false)).toBe('ab');
      expect(_formatCase('ABC', '_', false, false)).toBe('abc');
      expect(_formatCase('HELLO', '_', false, false)).toBe('hello');
    });

    test('should split when uppercase run is followed by lowercase', () => {
      expect(_formatCase('ABc', '_', false, false)).toBe('a_bc');
      expect(_formatCase('ABCd', '_', false, false)).toBe('ab_cd');
      expect(_formatCase('aBC', '_', false, false)).toBe('a_bc');
      expect(_formatCase('aBCd', '_', false, false)).toBe('a_b_cd');
    });

    test('should keep digits attached to surrounding letters', () => {
      expect(_formatCase('123abc', '_', false, false)).toBe('123abc');
      expect(_formatCase('abc123', '_', false, false)).toBe('abc123');
      expect(_formatCase('foo2bar', '_', false, false)).toBe('foo2bar');
    });

    test('should split when uppercase follows digit', () => {
      expect(_formatCase('123ABC', '_', false, false)).toBe('123_abc');
      expect(_formatCase('abc 123 def', '_', false, false)).toBe('abc_123_def');
    });

    test('should handle pure-digit input', () => {
      expect(_formatCase('12345', '_', false, false)).toBe('12345');
      expect(_formatCase('12345', '', true, true)).toBe('12345');
    });

    test('should treat non-separator symbols as part of word', () => {
      expect(_formatCase('foo$bar', '_', false, false)).toBe('foo$bar');
      expect(_formatCase('foo.bar', '_', false, false)).toBe('foo.bar');
      expect(_formatCase('foo@bar', '_', false, false)).toBe('foo@bar');
    });

    test('should handle non-ASCII characters', () => {
      expect(_formatCase('über', '_', false, false)).toBe('über');
      expect(_formatCase('ÜBer', '_', false, false)).toBe('ü_ber');
      expect(_formatCase('café', '_', false, false)).toBe('café');
      expect(_formatCase('CAFÉ', '_', false, false)).toBe('café');
      expect(_formatCase('über', '', true, true)).toBe('Über');
      expect(_formatCase('CAFÉ', '', true, true)).toBe('Café');
    });

    test('should handle complex mixed input', () => {
      expect(_formatCase('this_is-aTest_String', '_', false, false)).toBe(
        'this_is_a_test_string'
      );
      expect(_formatCase('V2_API_token', '_', false, false)).toBe(
        'v2_api_token'
      );
      expect(_formatCase('___init__', '_', false, false)).toBe('init');
      expect(_formatCase('PDFLoader', '_', false, false)).toBe('pdf_loader');
    });
  });
});
