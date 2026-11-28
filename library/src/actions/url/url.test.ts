import { afterEach, describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { url, type UrlAction, type UrlIssue } from './url.ts';

describe('url', () => {
  describe('should return action object', () => {
    const baseAction: Omit<UrlAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'url',
      reference: url,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: UrlAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(url()).toStrictEqual(action);
      expect(url(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(url('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies UrlAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(url(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies UrlAction<string, typeof message>);
    });
  });

  describe('should detect URL.canParse support', () => {
    const inputs: [string, boolean][] = [
      ['https://example.com', true],
      ['example.com', false],
      ['abc:1234', true],
      ['mailto:user@example.com', true],
      ['https://例え.テスト', true],
      ['/relative/path', false],
      ['https://', false],
      ['https://[::1', false],
    ];

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    test('for environment with URL.canParse', () => {
      const canParseSpy = vi.spyOn(URL, 'canParse');
      const action = url();
      for (const [input, expected] of inputs) {
        expect(action.requirement(input)).toBe(expected);
      }
      expect(canParseSpy).toHaveBeenCalledTimes(inputs.length);
    });

    test('for environment without URL.canParse', () => {
      const constructorSpy = vi.fn();
      class MockURL extends globalThis.URL {
        constructor(input: string) {
          constructorSpy(input);
          super(input);
        }
      }
      Object.defineProperty(MockURL, 'canParse', { value: undefined });
      vi.stubGlobal('URL', MockURL);
      expect(typeof URL.canParse).toBe('undefined');
      const action = url();
      for (const [input, expected] of inputs) {
        expect(action.requirement(input)).toBe(expected);
      }
      expect(constructorSpy).toHaveBeenCalledTimes(inputs.length);
    });

    test('for environment without URL', () => {
      const urlDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'URL');
      if (!urlDescriptor) {
        throw new Error('Expected URL to be defined on globalThis');
      }
      try {
        expect(Reflect.deleteProperty(globalThis, 'URL')).toBe(true);
        const action = url();
        expect(action.requirement('https://example.com')).toBe(false);
      } finally {
        Object.defineProperty(globalThis, 'URL', urlDescriptor);
      }
    });
  });

  describe('should return dataset without issues', () => {
    const action = url();

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

    test('for a HTTP URL', () => {
      expectNoActionIssue(action, [
        'http://example.com',
        'http://www.example.com/path',
        'http://subdomain1.subdomain2.example.com/path1/path2?param1=value1&param2=value2',
      ]);
    });

    test('for a HTTPS URL', () => {
      expectNoActionIssue(action, [
        'https://example.com',
        'https://www.example.com/path',
        'https://subdomain1.subdomain2.example.com/path1/path2?param1=value1&param2=value2',
      ]);
    });

    test('for a FTP URL', () => {
      expectNoActionIssue(action, [
        'ftp://example.com',
        'ftp://www.example.com/path',
        'ftp://subdomain1.subdomain2.example.com/path1/path2?param1=value1&param2=value2',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = url('message');
    const baseIssue: Omit<UrlIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'url',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for URL without schema', () => {
      expectActionIssue(action, baseIssue, [
        'example.com',
        'www.example.com/path',
        'subdomain1.subdomain2.example.com/path1/path2?param1=value1&param2=value2',
      ]);
    });
  });
});
