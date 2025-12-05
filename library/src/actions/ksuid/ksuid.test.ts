import { describe, expect, test } from 'vitest';
import { KSUID_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ksuid, type KsuidAction, type KsuidIssue } from './ksuid.ts';















describe('ulid', () => {
  describe('should return action object', () => {
    const baseAction: Omit<KsuidAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'ksuid',
      reference: ksuid,
      expects: null,
      requirement: KSUID_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: KsuidAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(ksuid()).toStrictEqual(action);
      expect(ksuid(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(ksuid('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies KsuidAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(ksuid(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies KsuidAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = ksuid();

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

    test('for valid KSUIDs', () => {
      expectNoActionIssue(action, [
        '0ujsswThIGTUYm2K8FjOOfXtY1K',
        '2EbKL0J9w8vLcK7BDmFnRQy0w1p',
        '1srOrx2ZWZBpBUvZwXKQmoEYga2',
        '36QGvpFmeYRDTH3mI14XJz31xUs',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = ksuid('message');
    const baseIssue: Omit<KsuidIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'ksuid',
      expected: null,
      message: 'message',
      requirement: KSUID_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 0ujsswThIGTUYm2K8FjOOfXtY1K',
        '0ujsswThIGTUYm2K8FjOOfXtY1K ',
        ' 0ujsswThIGTUYm2K8FjOOfXtY1K ',
      ]);
    });

    test('for too short ULIDs', () => {
      expectActionIssue(action, baseIssue, [
        '0ujsswThIGTUYm2K8FjOOfXtY1',
        '2EbKL0J9w8vLcK7B',
      ]);
    });

    test('for too long ULIDs', () => {
      expectActionIssue(action, baseIssue, [
        '0ujsswThIGTUYm2K8FjOOfXtY1Ka',
        '2EbKL0J9w8vLcK7BDmFnRQy0w1p123456',
      ]);
    });

    test('for invalid letters', () => {
      expectActionIssue(action, baseIssue, [
        '!ujsswThIGTUYm2K8FjOOfXtY1',
        '0ujsswThIGTUYm2K8FjOOfXtY@1',
      ]);
    });
  });
});
