import { describe, expect, test } from 'vitest';
import { NANO_ID_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { nanoid, type NanoIdAction, type NanoIdIssue } from './nanoid.ts';

describe('nanoid', () => {
  describe('should return action object', () => {
    const baseAction: Omit<NanoIdAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'nanoid',
      reference: nanoid,
      expects: null,
      requirement: NANO_ID_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: NanoIdAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(nanoid()).toStrictEqual(action);
      expect(nanoid(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(nanoid('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies NanoIdAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(nanoid(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies NanoIdAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = nanoid();

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

    test('for normal Nano IDs', () => {
      expectNoActionIssue(action, [
        'NOi6NWfhDRpgzBYFRR-uE',
        'D7j9AWMA6anLPDE2_2uHz',
        'g_Se_MXrTmRJpmcp8cN5m',
        'Oc0XNYtCgyrX-x2T33z3E',
        'gGCr-6yBmZkOTJQ1oLAFr',
      ]);
    });

    test('for single char', () => {
      expectNoActionIssue(action, ['a', 'z', 'A', 'Z', '0', '9', '_', '-']);
    });

    test('for two chars', () => {
      expectNoActionIssue(action, ['aa', 'zz', 'AZ', '09', '_-', '9A']);
    });

    test('for long IDs', () => {
      expectNoActionIssue(action, [
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = nanoid('message');
    const baseIssue: Omit<NanoIdIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'nanoid',
      expected: null,
      message: 'message',
      requirement: NANO_ID_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' vM7SGqVFmPS5tw7fII-G',
        'BImGM 7USGakXaVhydHgO',
        'LBjowKnkbk95kK3IoUV7 ',
      ]);
    });

    test('for special chars', () => {
      expectActionIssue(action, baseIssue, [
        '@1o5BK76uGc-mbqeprAvX',
        '#Lcb2qbTsjS98y9Vf-G15',
        '$3WZ4tXxsuiDBezXIJKlP',
        '%gSjBHLFDO67bE-nbgBRi',
        '&2zYmqr0APdImhdxC69t4',
        '–gGCr6yBmZkOTJQ1oLAFr',
      ]);
    });
  });
});
