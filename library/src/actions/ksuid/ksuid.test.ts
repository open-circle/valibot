import { describe, expect, test } from 'vitest';
import { KSUID_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { ksuid, type KsuidAction, type KsuidIssue } from './ksuid.ts';

describe('ksuid', () => {
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
        '3epBpcELgAkFoNQy3BlK1J9BY57',
        'Rmm5FKDviAXZql67OElDCp74v8s',
        'WEr9YJoQFr7RJiPs5f8IXOQ1gTS',
        'CJBS31EmdeKVGJ7W5aptJU0Lsk1',
      ]);
    });

    test('for minimum and maximum KSUIDs', () => {
      expectNoActionIssue(action, [
        '000000000000000000000000000',
        'aWgEPTl1tmebfsQzFP4bxwgy80V',
      ]);
    });

    test('for greatest valid KSUIDs per digit', () => {
      expectNoActionIssue(action, [
        'Zzzzzzzzzzzzzzzzzzzzzzzzzzz',
        'aVzzzzzzzzzzzzzzzzzzzzzzzzz',
        'aWfzzzzzzzzzzzzzzzzzzzzzzzz',
        'aWgDzzzzzzzzzzzzzzzzzzzzzzz',
        'aWgEOzzzzzzzzzzzzzzzzzzzzzz',
        'aWgEPSzzzzzzzzzzzzzzzzzzzzz',
        'aWgEPTkzzzzzzzzzzzzzzzzzzzz',
        'aWgEPTl0zzzzzzzzzzzzzzzzzzz',
        'aWgEPTl1szzzzzzzzzzzzzzzzzz',
        'aWgEPTl1tlzzzzzzzzzzzzzzzzz',
        'aWgEPTl1tmdzzzzzzzzzzzzzzzz',
        'aWgEPTl1tmeazzzzzzzzzzzzzzz',
        'aWgEPTl1tmebezzzzzzzzzzzzzz',
        'aWgEPTl1tmebfrzzzzzzzzzzzzz',
        'aWgEPTl1tmebfsPzzzzzzzzzzzz',
        'aWgEPTl1tmebfsQyzzzzzzzzzzz',
        'aWgEPTl1tmebfsQzEzzzzzzzzzz',
        'aWgEPTl1tmebfsQzFOzzzzzzzzz',
        'aWgEPTl1tmebfsQzFP3zzzzzzzz',
        'aWgEPTl1tmebfsQzFP4azzzzzzz',
        'aWgEPTl1tmebfsQzFP4bwzzzzzz',
        'aWgEPTl1tmebfsQzFP4bxvzzzzz',
        'aWgEPTl1tmebfsQzFP4bxwfzzzz',
        'aWgEPTl1tmebfsQzFP4bxwgxzzz',
        'aWgEPTl1tmebfsQzFP4bxwgy7zz',
        'aWgEPTl1tmebfsQzFP4bxwgy80U',
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

    test('for too short KSUIDs', () => {
      expectActionIssue(action, baseIssue, [
        '0ujsswThIGTUYm2K8FjOOfXtY1',
        '2EbKL0J9w8vLcK7B',
      ]);
    });

    test('for too long KSUIDs', () => {
      expectActionIssue(action, baseIssue, [
        '0ujsswThIGTUYm2K8FjOOfXtY1Ka',
        '2EbKL0J9w8vLcK7BDmFnRQy0w1p123456',
      ]);
    });

    test('for invalid letters', () => {
      expectActionIssue(action, baseIssue, [
        '!ujsswThIGTUYm2K8FjOOfXtY1K',
        '0ujsswThIGTUYm2K8FjOOfXtY@1',
      ]);
    });

    test('for overflowing KSUIDs', () => {
      expectActionIssue(action, baseIssue, [
        'aWgEPTl1tmebfsQzFP4bxwgy80W',
        'zzzzzzzzzzzzzzzzzzzzzzzzzzz',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaa',
        'tssZmdDCLYi51BCXwHwSI6au096',
        'iMjlE5HXV9kj7ld9YJHjqCVIW1I',
        'n9ZJCRKHZO0OjWevHd8p44LubQG',
        's2w9mpPIeWc4nQnYi375Mafq3Hg',
      ]);
    });

    test('for smallest overflowing KSUIDs per digit', () => {
      expectActionIssue(action, baseIssue, [
        'b00000000000000000000000000',
        'aX0000000000000000000000000',
        'aWh000000000000000000000000',
        'aWgF00000000000000000000000',
        'aWgEQ0000000000000000000000',
        'aWgEPU000000000000000000000',
        'aWgEPTm00000000000000000000',
        'aWgEPTl20000000000000000000',
        'aWgEPTl1u000000000000000000',
        'aWgEPTl1tn00000000000000000',
        'aWgEPTl1tmf0000000000000000',
        'aWgEPTl1tmec000000000000000',
        'aWgEPTl1tmebg00000000000000',
        'aWgEPTl1tmebft0000000000000',
        'aWgEPTl1tmebfsR000000000000',
        'aWgEPTl1tmebfsQzG0000000000',
        'aWgEPTl1tmebfsQzFQ000000000',
        'aWgEPTl1tmebfsQzFP500000000',
        'aWgEPTl1tmebfsQzFP4c0000000',
        'aWgEPTl1tmebfsQzFP4by000000',
        'aWgEPTl1tmebfsQzFP4bxx00000',
        'aWgEPTl1tmebfsQzFP4bxwh0000',
        'aWgEPTl1tmebfsQzFP4bxwgz000',
        'aWgEPTl1tmebfsQzFP4bxwgy900',
        'aWgEPTl1tmebfsQzFP4bxwgy810',
      ]);
    });
  });
});
