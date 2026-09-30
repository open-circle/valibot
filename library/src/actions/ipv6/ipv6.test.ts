import { describe, expect, test } from 'vitest';
import { IPV6_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ipv6, type Ipv6Action, type Ipv6Issue } from './ipv6.ts';

// TODO: Improve tests to cover all possible scenarios based on the regex used.

describe('ipv6', () => {
  describe('should return action object', () => {
    const baseAction: Omit<Ipv6Action<string, never>, 'message'> = {
      kind: 'validation',
      type: 'ipv6',
      reference: ipv6,
      expects: null,
      requirement: IPV6_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: Ipv6Action<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(ipv6()).toStrictEqual(action);
      expect(ipv6(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(ipv6('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies Ipv6Action<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(ipv6(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies Ipv6Action<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = ipv6();

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

    test('for IPv6 address', () => {
      expectNoActionIssue(action, [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        'FE80:0000:0000:0000:0202:B3FF:FE1E:8329',
        'fe80::1ff:fe23:4567:890a',
        '2001:db8:85a3:8d3:1319:8a2e:370:7348',
      ]);
    });

    test('for IPv6 address with embedded IPv4 address', () => {
      expectNoActionIssue(action, [
        '::13.1.68.3',
        '::ffff:129.144.52.38',
        '::ffff:0:192.168.1.1',
        '64:ff9b::192.0.2.33',
        '1:2:3:4::192.168.1.1',
        '0:0:0:0:0:0:13.1.68.3',
        '0:0:0:0:0:FFFF:129.144.52.38',
        '::1:2:3:4:192.168.1.1',
        '1::2:3:4:5:192.168.1.1',
        '1:2:3:4:5::192.168.1.1',
        '1:2:3::192.168.1.1',
        '1:2:3::4:5:192.168.1.1',
        '64:ff9b:1::10.0.0.1',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = ipv6('message');
    const baseIssue: Omit<Ipv6Issue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'ipv6',
      expected: null,
      message: 'message',
      requirement: IPV6_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid IPv6 address', () => {
      expectActionIssue(action, baseIssue, [
        'd329:1be4:25b4:db47:a9d1:dc71:4926:992c:14af',
        'd5e7:7214:2b78::3906:85e6:53cc:709:32ba',
        '8f69::c757:395e:976e::3441',
        '54cb::473f:d516:0.255.256.22',
        '54cb::473f:d516:192.168.1',
        '1:2:3:4:5:6:7:192.168.1.1',
        '1:2:3:4:5:6::192.168.1.1',
        '::1:2:3:4:5:6:192.168.1.1',
        '1::2:3:4:5:6:192.168.1.1',
        '1:2:3::4:5:6:192.168.1.1',
        '1:2:3:4:5:6:192.168.1',
        'test:test:test:test:test:test:test:test',
      ]);
    });

    test('for IPv4 address', () => {
      expectActionIssue(action, baseIssue, [
        '192.168.1.1',
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
      ]);
    });
  });
});
