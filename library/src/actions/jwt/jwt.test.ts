import { describe, expect, test } from 'vitest';
import { JWT_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { jwt, type JwtAction, type JwtIssue } from './jwt.ts';

describe('jwt', () => {
  describe('should return action object', () => {
    const baseAction: Omit<JwtAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'jwt',
      reference: jwt,
      expects: null,
      requirement: JWT_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: JwtAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(jwt()).toStrictEqual(action);
      expect(jwt(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(jwt('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies JwtAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(jwt(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies JwtAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = jwt();

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

    test('for valid JWTs', () => {
      expectNoActionIssue(action, [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJleGFtcGxlLmNvbSIsImV4cCI6MTY4MTk3OTAyMn0.DBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2ODI1MDAwMDB9.dBjftJeZ4CVP_mB92K27uhbUJW1p1r_wW1gFWFOEjXk',
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZG1pbiI6dHJ1ZX0.OX6Ys9b0N_0dQPGPv_7nAYtwo7i_S3lBCJoZ4CZz2uk',
        'eyJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJzdWIiOiIxMjMiLCJpc3MiOiJleGFtcGxlLmNvbSJ9.xmx1rd_lFfq7uO_vAnCkBZW4h_Mdw-CJNh0-j8l1DEk',
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.c2lnbmF0dXJl==',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = jwt('message');
    const baseIssue: Omit<JwtIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'jwt',
      expected: null,
      message: 'message',
      requirement: JWT_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for missing segments', () => {
      expectActionIssue(action, baseIssue, [
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
        'header.payload',
      ]);
    });

    test('for additional segments', () => {
      expectActionIssue(action, baseIssue, [
        'header.payload.signature.extra',
        'a.b.c.d',
      ]);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature ',
        'eyJhbGciOiJIUzI1NiJ9 .eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
      ]);
    });

    test('for invalid characters', () => {
      expectActionIssue(action, baseIssue, [
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.sign@ture',
        'header.payload.signa ture',
        'header.payload.sig\\u00a9nature',
      ]);
    });
  });
});
