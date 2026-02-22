import { describe, expect, test } from 'vitest';
import {
  stringbool,
  type StringboolAction,
  type StringboolIssue,
  type StringboolOptions,
} from './stringbool.ts';

describe('stringbool', () => {
  const defaultExpected =
    '("true" | "1" | "yes" | "y" | "on" | "enabled" | "false" | "0" | "no" | "n" | "off" | "disabled")';

  describe('should return action object', () => {
    test('for default options', () => {
      expect(stringbool()).toStrictEqual({
        kind: 'transformation',
        type: 'stringbool',
        reference: stringbool,
        expects: defaultExpected,
        options: {
          truthy: ['true', '1', 'yes', 'y', 'on', 'enabled'],
          falsy: ['false', '0', 'no', 'n', 'off', 'disabled'],
          case: 'insensitive',
        },
        async: false,
        '~run': expect.any(Function),
      } satisfies StringboolAction<unknown>);
    });

    test('for custom options truthy only', () => {
      const options: StringboolOptions = {
        truthy: ['yep'],
      };

      expect(stringbool(options)).toStrictEqual({
        kind: 'transformation',
        type: 'stringbool',
        reference: stringbool,
        expects: '("yep" | "false" | "0" | "no" | "n" | "off" | "disabled")',
        options: {
          truthy: ['yep'],
          falsy: ['false', '0', 'no', 'n', 'off', 'disabled'],
          case: 'insensitive',
        },
        async: false,
        '~run': expect.any(Function),
      } satisfies StringboolAction<unknown>);
    });

    test('for custom options case undefined', () => {
      const options: StringboolOptions = {
        truthy: ['yep'],
        falsy: ['nope'],
        case: undefined,
      };

      expect(stringbool(options)).toStrictEqual({
        kind: 'transformation',
        type: 'stringbool',
        reference: stringbool,
        expects: '("yep" | "nope")',
        options: {
          truthy: ['yep'],
          falsy: ['nope'],
          case: 'insensitive',
        },
        async: false,
        '~run': expect.any(Function),
      } satisfies StringboolAction<unknown>);
    });

    test('for custom options all together', () => {
      const options: StringboolOptions = {
        truthy: ['YEP'],
        falsy: ['NOPE'],
        case: 'sensitive',
      };

      expect(stringbool(options)).toStrictEqual({
        kind: 'transformation',
        type: 'stringbool',
        reference: stringbool,
        expects: '("YEP" | "NOPE")',
        options,
        async: false,
        '~run': expect.any(Function),
      } satisfies StringboolAction<unknown>);
    });
  });

  describe('should handle default options', () => {
    const action = stringbool();

    describe('for truthy values', () => {
      test('for "true"', () => {
        expect(
          action['~run']({ typed: true, value: 'true' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "1"', () => {
        expect(action['~run']({ typed: true, value: '1' }, {})).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "yes"', () => {
        expect(action['~run']({ typed: true, value: 'yes' }, {})).toStrictEqual(
          {
            typed: true,
            value: true,
          }
        );
      });

      test('for "y"', () => {
        expect(action['~run']({ typed: true, value: 'y' }, {})).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "on"', () => {
        expect(action['~run']({ typed: true, value: 'on' }, {})).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "enabled"', () => {
        expect(
          action['~run']({ typed: true, value: 'enabled' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "TRUE"', () => {
        expect(
          action['~run']({ typed: true, value: 'TRUE' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });
    });

    describe('for falsy values', () => {
      test('for "false"', () => {
        expect(
          action['~run']({ typed: true, value: 'false' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "0"', () => {
        expect(action['~run']({ typed: true, value: '0' }, {})).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "no"', () => {
        expect(action['~run']({ typed: true, value: 'no' }, {})).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "n"', () => {
        expect(action['~run']({ typed: true, value: 'n' }, {})).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "off"', () => {
        expect(action['~run']({ typed: true, value: 'off' }, {})).toStrictEqual(
          {
            typed: true,
            value: false,
          }
        );
      });

      test('for "disabled"', () => {
        expect(
          action['~run']({ typed: true, value: 'disabled' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "FALSE"', () => {
        expect(
          action['~run']({ typed: true, value: 'FALSE' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });
    });
  });

  describe('should handle custom options with `truthy` only', () => {
    describe('for lowercase `truthy` values', () => {
      const action = stringbool({
        truthy: ['yep'],
      });

      test('for "yep"', () => {
        expect(action['~run']({ typed: true, value: 'yep' }, {})).toStrictEqual(
          {
            typed: true,
            value: true,
          }
        );
      });

      test('for "YEP"', () => {
        expect(action['~run']({ typed: true, value: 'YEP' }, {})).toStrictEqual(
          {
            typed: true,
            value: true,
          }
        );
      });

      test('for "false"', () => {
        expect(
          action['~run']({ typed: true, value: 'false' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });
    });

    describe('for uppercase `truthy` values', () => {
      const action = stringbool({
        truthy: ['YEP'],
      });

      test('for "yep"', () => {
        expect(action['~run']({ typed: true, value: 'yep' }, {})).toStrictEqual(
          {
            typed: true,
            value: true,
          }
        );
      });

      test('for "YEP"', () => {
        expect(action['~run']({ typed: true, value: 'YEP' }, {})).toStrictEqual(
          {
            typed: true,
            value: true,
          }
        );
      });
    });
  });

  describe('should handle custom options with `falsy` only', () => {
    describe('for lowercase `falsy` values', () => {
      const action = stringbool({
        falsy: ['nope'],
      });

      test('for "nope"', () => {
        expect(
          action['~run']({ typed: true, value: 'nope' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "NOPE"', () => {
        expect(
          action['~run']({ typed: true, value: 'NOPE' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "true"', () => {
        expect(
          action['~run']({ typed: true, value: 'true' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });
    });

    describe('for uppercase `falsy` values', () => {
      const action = stringbool({
        falsy: ['NOPE'],
      });

      test('for "nope"', () => {
        expect(
          action['~run']({ typed: true, value: 'nope' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "NOPE"', () => {
        expect(
          action['~run']({ typed: true, value: 'NOPE' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });
    });
  });

  describe('should handle custom options with `case` only', () => {
    describe('for case sensitive', () => {
      const action = stringbool({
        case: 'sensitive',
      });

      test('for "true"', () => {
        expect(
          action['~run']({ typed: true, value: 'true' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "false"', () => {
        expect(
          action['~run']({ typed: true, value: 'false' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });
    });

    describe('for case insensitive', () => {
      const action = stringbool({
        case: 'insensitive',
      });

      test('for "true"', () => {
        expect(
          action['~run']({ typed: true, value: 'true' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "TRUE"', () => {
        expect(
          action['~run']({ typed: true, value: 'TRUE' }, {})
        ).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for "false"', () => {
        expect(
          action['~run']({ typed: true, value: 'false' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });

      test('for "FALSE"', () => {
        expect(
          action['~run']({ typed: true, value: 'FALSE' }, {})
        ).toStrictEqual({
          typed: true,
          value: false,
        });
      });
    });
  });

  describe('should handle custom options all together', () => {
    const action = stringbool({
      truthy: ['YEP'],
      falsy: ['NOPE'],
      case: 'sensitive',
    });

    test('for "YEP"', () => {
      expect(action['~run']({ typed: true, value: 'YEP' }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for "NOPE"', () => {
      expect(action['~run']({ typed: true, value: 'NOPE' }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });
  });

  describe('should return dataset with issues', () => {
    describe('for default options', () => {
      const action = stringbool();

      const baseIssue: Omit<
        StringboolIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'stringbool',
        expected: defaultExpected,
        requirement: undefined,
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      };

      test('for invalid input as Symbol', () => {
        const value = Symbol();

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: 'symbol',
              message: `Invalid stringbool: Expected ${defaultExpected} but received symbol`,
            },
          ],
        });
      });

      test('for invalid input as string', () => {
        const value = 'something';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '"something"',
              message: `Invalid stringbool: Expected ${defaultExpected} but received "something"`,
            },
          ],
        });
      });

      test('for invalid input as number', () => {
        const value = 123;

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '123',
              message: `Invalid stringbool: Expected ${defaultExpected} but received 123`,
            },
          ],
        });
      });
    });

    describe('for custom options truthy only', () => {
      const action = stringbool({
        truthy: ['yep'],
      });

      const baseIssue: Omit<
        StringboolIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'stringbool',
        expected: '("yep" | "false" | "0" | "no" | "n" | "off" | "disabled")',
        requirement: undefined,
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      };

      test('for invalid input as string', () => {
        const value = 'enabled';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '"enabled"',
              message: `Invalid stringbool: Expected ${baseIssue.expected} but received "enabled"`,
            },
          ],
        });
      });
    });

    describe('for custom options falsy only', () => {
      const action = stringbool({
        falsy: ['nope'],
      });

      const baseIssue: Omit<
        StringboolIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'stringbool',
        expected: '("true" | "1" | "yes" | "y" | "on" | "enabled" | "nope")',
        requirement: undefined,
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      };

      test('for invalid input as string', () => {
        const value = 'disabled';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '"disabled"',
              message: `Invalid stringbool: Expected ${baseIssue.expected} but received "disabled"`,
            },
          ],
        });
      });
    });

    describe('for custom options all together', () => {
      const action = stringbool({
        truthy: ['YEP'],
        falsy: ['NOPE'],
        case: 'sensitive',
      });

      const baseIssue: Omit<
        StringboolIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'stringbool',
        expected: '("YEP" | "NOPE")',
        requirement: undefined,
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      };

      test('for invalid lowercase input as string "yep"', () => {
        const value = 'yep';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '"yep"',
              message: `Invalid stringbool: Expected ${baseIssue.expected} but received "yep"`,
            },
          ],
        });
      });

      test('for invalid lowercase input as string "nope"', () => {
        const value = 'nope';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '"nope"',
              message: `Invalid stringbool: Expected ${baseIssue.expected} but received "nope"`,
            },
          ],
        });
      });
    });
  });
});
