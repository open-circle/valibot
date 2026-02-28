import { describe, expect, test } from 'vitest';
import { DOMAIN_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { domain, type DomainAction, type DomainIssue } from './domain.ts';

describe('domain', () => {
  describe('should return action object', () => {
    const baseAction: Omit<DomainAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'domain',
      reference: domain,
      expects: null,
      requirement: DOMAIN_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: DomainAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(domain()).toStrictEqual(action);
      expect(domain(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(domain('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies DomainAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(domain(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies DomainAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = domain();

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

    test('for common domains', () => {
      expectNoActionIssue(action, [
        'example.com',
        'EXAMPLE.COM',
        'sub.example.com',
        'sub.sub2.example.co.uk',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = domain('message');
    const baseIssue: Omit<DomainIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'domain',
      expected: null,
      message: 'message',
      requirement: DOMAIN_REGEX,
    };

    test('too long label (max 63 chars)', () => {
      const tooLongLabel = 'a'.repeat(64);
      const domainWithTooLongLabel = tooLongLabel + '.com';
      expect(domainWithTooLongLabel.length).toBeGreaterThan(63);
      expectActionIssue(action, baseIssue, ['a'.repeat(64) + '.com']);
    });

    test('too long TLD (max 63 chars)', () => {
      const tooLongTLD = 'a'.repeat(64);
      const domainWithTooLongTLD = `example.${tooLongTLD}`;
      expect(domainWithTooLongTLD.length).toBeGreaterThan(63);
      expectActionIssue(action, baseIssue, [domainWithTooLongTLD]);
    });

    test('too long domain (max 253 chars)', () => {
      const label = 'a'.repeat(63);
      const tooLongDomain = `${label}.${label}.${label}.${label}.${label}.com`;
      expect(tooLongDomain.length).toBeGreaterThan(253);
      expectActionIssue(action, baseIssue, [tooLongDomain]);
    });

    test('for empty or whitespace strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n', '\t']);
    });

    test('for missing TLD or single label', () => {
      expectActionIssue(action, baseIssue, [
        'localhost',
        'intranet',
        'example',
      ]);
    });

    test('for invalid label starts/ends', () => {
      expectActionIssue(action, baseIssue, [
        '-example.com',
        'example-.com',
        '.example.com',
        'example..com',
        'example.com.',
        'example.c',
      ]);
    });

    test('for invalid characters and formats', () => {
      expectActionIssue(action, baseIssue, [
        'exa mple.com',
        'example!.com',
        'exa*mple.com',
        'ex_amp.le.com',
        '*.example.com',
        'http://example.com',
      ]);
    });
  });
});
