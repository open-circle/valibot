import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { imei, type ImeiAction, type ImeiIssue } from './imei.ts';

describe('imei', () => {
  describe('should return action object', () => {
    const baseAction: Omit<ImeiAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'imei',
      reference: imei,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: ImeiAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(imei()).toStrictEqual(action);
      expect(imei(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(imei('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies ImeiAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(imei(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies ImeiAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = imei();

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

    test('for valid IMEI without separators', () => {
      expectNoActionIssue(action, [
        '861812069402168',
        '536498459191226',
        '454438576454550',
        '356741089396021',
      ]);
    });

    test('for valid IMEI with separators', () => {
      expectNoActionIssue(action, [
        '86-181206-940216-8',
        '53-649845-919122-6',
        '45-443857-645455-0',
        '35-674108-939602-1',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = imei('message');
    const baseIssue: Omit<ImeiIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'imei',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' 861812069402168',
        '861812069402168 ',
        ' 861812069402168 ',
      ]);
    });

    test('for missing separators', () => {
      expectActionIssue(action, baseIssue, [
        '86181206-940216-8',
        '86-181206940216-8',
        '86-181206-9402168',
      ]);
    });

    test('for double separators', () => {
      expectActionIssue(action, baseIssue, [
        '86--181206-940216-8',
        '86-181206--940216-8',
        '86-181206-940216--8',
        '86--181206--940216--8',
      ]);
    });

    test('for invalid separators', () => {
      expectActionIssue(action, baseIssue, [
        '86 181206 940216 8',
        '86/181206/940216/8',
        '86_181206_940216_8',
        '86–181206–940216–8',
      ]);
    });

    test('for invalid digit count', () => {
      expectActionIssue(action, baseIssue, [
        '86181206940216', // 14 digits
        '8618120694021683', // 16 digits
        '8-181206-940216-8', // missing A digit
        '862-181206-940216-8', // extra A digit
        '86-11206-940216-8', // missing B digit
        '86-1817206-940216-8', // extra B digit
        '86-181206-94216-8', // missing C digit
        '86-181206-9408216-8', // extra C digit
        '86-181206-940216', // missing D digit
        '86-181206-940216-', // missing D digit
        '86-181206-940216-82', // extra D digit
      ]);
    });

    test('for non digit chars', () => {
      expectActionIssue(action, baseIssue, [
        '861812A69402168', // A digit
        '8A-181206-940216-8', // A digit
        '861812a69402168', // a digit
        '86-1a1206-940216-8', // a digit
        '86181206Z402168', // Z digit
        '86-181206-9402Z6-8', // Z digit
        '86181206z402168', // z digit
        '86-181206-940216-z', // z digit
        '861812069$02168', // $ digit
        '86-18$206-940216-8', // $ digit
        '861@12069402168', // @ digit
        '86-181206-94@216-8', // @ digit
      ]);
    });

    test('for invalid check digit', () => {
      expectActionIssue(action, baseIssue, [
        '861812069402163',
        '536498459191225',
        '454438576454552',
        '356741089396029',
      ]);
    });
  });
});
