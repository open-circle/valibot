import { describe, expect, test } from 'vitest';
import { IPV4_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ipv4, type Ipv4Action, type Ipv4Issue } from './ipv4.ts';

describe('ipv4', () => {
  describe('should return action object', () => {
    const baseAction: Omit<Ipv4Action<string, never>, 'message'> = {
      kind: 'validation',
      type: 'ipv4',
      reference: ipv4,
      expects: null,
      requirement: IPV4_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: Ipv4Action<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(ipv4()).toStrictEqual(action);
      expect(ipv4(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(ipv4('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies Ipv4Action<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(ipv4(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies Ipv4Action<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = ipv4();

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
        '10.10.10.10',
        '90.90.90.90',
        '50.60.70.80',
        '100.100.100.100',
        '190.190.190.190',
        '150.150.150.150',
        '200.200.200.200',
        '240.240.240.240',
        '0.0.0.0',
        '9.9.9.9',
        '5.5.5.5',
        '250.250.250.250',
        '255.255.255.255',
        '19.19.19.19',
        '99.99.99.99',
        '59.69.79.89',
        '109.109.109.109',
        '199.199.199.199',
        '159.159.159.159',
        '209.209.209.209',
        '249.249.249.249',
        '15.15.15.15',
        '95.95.95.95',
        '55.65.75.85',
        '105.105.105.105',
        '195.195.195.195',
        '155.155.155.155',
        '205.205.205.205',
        '245.245.245.245',
        '00.00.00.00',
        '09.09.09.09',
        '05.05.05.05',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = ipv4('message');
    const baseIssue: Omit<Ipv4Issue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'ipv4',
      expected: null,
      message: 'message',
      requirement: IPV4_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '  ', '\n', '\t']);
    });

    test('for invalid IPv4 address', () => {
      expectActionIssue(action, baseIssue, [
        '1',
        '-1.0.0.0',
        '0..0.0.0',
        '1234.0.0.0',
        '1.2.3',
        '0.0.0.0.0',
        'a.a.a.a',
        '+1.2.3.4',
        ' 0.0.0.0',
        '0.0.0.0 ',
        '0.0 0.0',
        '0-0-0-0',
        '256.256.256.256',
        '-1.-1.-1.-1',
        '259.259.259.259',
        '0256.002.003.004',
      ]);
    });

    test('for IPv6 address', () => {
      expectActionIssue(action, baseIssue, [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        'FE80:0000:0000:0000:0202:B3FF:FE1E:8329',
        'fe80::1ff:fe23:4567:890a',
        '2001:db8:85a3:8d3:1319:8a2e:370:7348',
        // IPv4-mapped IPv6
        '::ffff:192.168.1.1',
        '::ffff:0.0.0.0',
        '::ffff:255.255.255.255',
      ]);
    });
  });
});
