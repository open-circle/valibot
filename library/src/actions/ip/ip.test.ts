import { describe, expect, test } from 'vitest';
import { IP_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ip, type IpAction, type IpIssue } from './ip.ts';

// TODO: Improve tests to cover all possible scenarios based on the regex used.

describe('ip', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IpAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'ip',
      reference: ip,
      expects: null,
      requirement: IP_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IpAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(ip()).toStrictEqual(action);
      expect(ip(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(ip('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IpAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(ip(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IpAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = ip();

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

    test('for IPv4 address', () => {
      expectNoActionIssue(action, [
        '192.168.1.1',
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
        // leading-zero octets – must be accepted by ip() just as by ipv4()
        '00.00.00.00',
        '09.09.09.09',
        '001.002.003.004',
      ]);
    });

    test('for IPv6 address', () => {
      expectNoActionIssue(action, [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        'FE80:0000:0000:0000:0202:B3FF:FE1E:8329',
        'fe80::1ff:fe23:4567:890a',
        '2001:db8:85a3:8d3:1319:8a2e:370:7348',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = ip('message');
    const baseIssue: Omit<IpIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'ip',
      expected: null,
      message: 'message',
      requirement: IP_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid IPv4 address', () => {
      expectActionIssue(action, baseIssue, [
        '1',
        '-1.0.0.0',
        '0..0.0.0',
        '1234.0.0.0',
        '256.256.256.256',
        '1.2.3',
        '0.0.0.0.0',
        'a.a.a.a',
      ]);
    });

    test('for invalid IPv6 address', () => {
      expectActionIssue(action, baseIssue, [
        'd329:1be4:25b4:db47:a9d1:dc71:4926:992c:14af',
        'd5e7:7214:2b78::3906:85e6:53cc:709:32ba',
        '8f69::c757:395e:976e::3441',
        '54cb::473f:d516:0.255.256.22',
        '54cb::473f:d516:192.168.1',
        'test:test:test:test:test:test:test:test',
      ]);
    });
  });
});
