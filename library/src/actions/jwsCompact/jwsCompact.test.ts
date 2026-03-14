import { describe, expect, test } from 'vitest';
import { JWS_COMPACT_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import {
  jwsCompact,
  type JwsCompactAction,
  type JwsCompactIssue,
} from './jwsCompact.ts';

describe('jwsCompact', () => {
  describe('should return action object', () => {
    const baseAction: Omit<JwsCompactAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'jws_compact',
      reference: jwsCompact,
      expects: null,
      requirement: JWS_COMPACT_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: JwsCompactAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(jwsCompact()).toStrictEqual(action);
      expect(jwsCompact(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(jwsCompact('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies JwsCompactAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(jwsCompact(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies JwsCompactAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = jwsCompact();

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

    test('for valid JWS compact strings', () => {
      expectNoActionIssue(action, [
        'ab.cd.ef',
        'abc.def.ghi',
        'abcd.efgh.ijkl',
        'abcdef.ghijkl.mnopqr',
        'ab_cd-.ef-gh_.ij_kl-',
        'abcdefgh.ijklmnop.qrstuvwx',
        'abcd.efgh.',
      ]);
    });

    test('for empty payload segments', () => {
      expectNoActionIssue(action, ['abcd..ijkl', 'abcdef..']);
    });
  });

  describe('should return dataset with issues', () => {
    const action = jwsCompact('message');
    const baseIssue: Omit<JwsCompactIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'jws_compact',
      expected: null,
      message: 'message',
      requirement: JWS_COMPACT_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for missing segments', () => {
      expectActionIssue(action, baseIssue, ['abcd.efgh', 'segment.twopart']);
    });

    test('for additional segments', () => {
      expectActionIssue(action, baseIssue, [
        'header.payload.signature.extra',
        'a.b.c.d',
      ]);
    });

    test('for invalid base64url segments', () => {
      expectActionIssue(action, baseIssue, [
        'a.a.a',
        'ab=.cd.ef',
        'abc==.def.ghi',
        'abcd.efgh.ijkl==',
      ]);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' abcd.efgh.ijkl',
        'abcd.efgh.ijkl ',
        'abcd .efgh.ijkl',
      ]);
    });

    test('for invalid characters', () => {
      expectActionIssue(action, baseIssue, [
        'abcd.efgh.ij@l',
        'segment.twopart.si gnature',
        'segment.twopart.si\\u00a9gnature',
      ]);
    });
  });
});
