import { describe, expect, test } from 'vitest';
import { ISRC_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { isrc, type IsrcAction, type IsrcIssue } from './isrc.ts';

describe('isrc', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IsrcAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'isrc',
      reference: isrc,
      expects: null,
      requirement: ISRC_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IsrcAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(isrc()).toStrictEqual(action);
      expect(isrc(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(isrc('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IsrcAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(isrc(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IsrcAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = isrc();

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

    test('for valid ISRC without separators', () => {
      expectNoActionIssue(action, [
        'DEU671703268',
        'FRIDO2512641',
        'GBBPW0700093',
        'US2S70465020',
      ]);
    });

    test('for valid ISRC with separators', () => {
      expectNoActionIssue(action, [
        'DE-U67-17-03268',
        'FR-IDO-25-12641',
        'GB-BPW-07-00093',
        'US-2S7-04-65020',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = isrc('message');
    const baseIssue: Omit<IsrcIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'isrc',
      expected: null,
      message: 'message',
      requirement: ISRC_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' DE-U67-17-03268',
        'DE-U67-17-03268 ',
        ' DE-U67-17-03268 ',
      ]);
    });

    test('for missing separators', () => {
      expectActionIssue(action, baseIssue, [
        'DEU67-17-03268',
        'DE-U6717-03268',
        'DE-U67-1703268',
      ]);
    });

    test('for double separators', () => {
      expectActionIssue(action, baseIssue, [
        'DE--U67-17-03268',
        'DE-U67--17-03268',
        'DE-U67-17--03268',
        'DE--U67--17--03268',
      ]);
    });

    test('for invalid separators', () => {
      expectActionIssue(action, baseIssue, [
        'DE U67 17 03268',
        'DE/U67/17/03268',
        'DE_U67_17_03268',
        'DE–U67–17–03268',
      ]);
    });

    test('for invalid digit count', () => {
      expectActionIssue(action, baseIssue, [
        'D-U67-17-03268', // missing A digit
        'DEU-U67-17-03268', // extra A digit
        'DE-U6-17-03268', // missing B digit
        'DE-U67x-17-03268', // extra B digit
        'DE-U67-1-03268', // missing C digit
        'DE-U67-170-03268', // extra C digit
        'DE-U67-17-0326', // missing D digit
        'DE-U67-17-032680', // extra D digit
      ]);
    });

    test('for invalid fragments', () => {
      expectActionIssue(action, baseIssue, [
        '0EU671703268', // Country Code-fragment
        '0E-U67-17-03268', // Country Code-fragment
        'DEa671703268', // Registrant Code-fragment
        'DE-a67-17-03268', // Registrant Code-fragment
        'DEU67A703268', // Year of Reference-fragment
        'DE-U67-A7-03268', // Year of Reference-fragment
        'DEU6717A3268', // Designation Code-fragment
        'DE-U67-17-A3268', // Designation Code-fragment
      ]);
    });
  });
});
