import { describe, expect, test } from 'vitest';
import {
  parseBoolean,
  type ParseBooleanAction,
  type ParseBooleanConfig,
  type ParseBooleanIssue,
} from './parseBoolean.ts';

describe('parseBoolean', () => {
  const defaultExpected =
    '(true | 1 | "true" | "1" | "yes" | "y" | "on" | "enabled" | false | 0 | "false" | "0" | "no" | "n" | "off" | "disabled")';

  describe('should return action object', () => {
    const config: ParseBooleanConfig = {
      truthy: ['yep'],
      falsy: ['nope'],
    };
    const baseAction: Omit<
      ParseBooleanAction<unknown, never, never>,
      'message' | 'config' | 'expects'
    > = {
      kind: 'transformation',
      type: 'parse_boolean',
      reference: parseBoolean,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined config and undefined message', () => {
      const action: ParseBooleanAction<unknown, undefined, undefined> = {
        ...baseAction,
        expects: defaultExpected,
        config: undefined,
        message: undefined,
      };
      expect(parseBoolean()).toStrictEqual(action);
      expect(parseBoolean(undefined)).toStrictEqual(action);
      expect(parseBoolean(undefined, undefined)).toStrictEqual(action);
    });

    test('with undefined config and string message', () => {
      expect(parseBoolean(undefined, 'message')).toStrictEqual({
        ...baseAction,
        expects: defaultExpected,
        config: undefined,
        message: 'message',
      } satisfies ParseBooleanAction<unknown, undefined, 'message'>);
    });

    test('with undefined config and function message', () => {
      const message = () => 'message';
      expect(parseBoolean(undefined, message)).toStrictEqual({
        ...baseAction,
        expects: defaultExpected,
        config: undefined,
        message,
      } satisfies ParseBooleanAction<unknown, undefined, () => string>);
    });

    test('with config and undefined message', () => {
      const action: ParseBooleanAction<unknown, typeof config, undefined> = {
        ...baseAction,
        expects: '("yep" | "nope")',
        config,
        message: undefined,
      };
      expect(parseBoolean(config)).toStrictEqual(action);
      expect(parseBoolean(config, undefined)).toStrictEqual(action);
    });

    test('with config and string message', () => {
      expect(parseBoolean(config, 'message')).toStrictEqual({
        ...baseAction,
        expects: '("yep" | "nope")',
        config,
        message: 'message',
      } satisfies ParseBooleanAction<unknown, typeof config, 'message'>);
    });

    test('with config and function message', () => {
      const message = () => 'message';
      expect(parseBoolean(config, message)).toStrictEqual({
        ...baseAction,
        expects: '("yep" | "nope")',
        config,
        message,
      } satisfies ParseBooleanAction<unknown, typeof config, () => string>);
    });
  });

  describe('should handle default config', () => {
    const action = parseBoolean();

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

      test('for boolean true', () => {
        expect(action['~run']({ typed: true, value: true }, {})).toStrictEqual({
          typed: true,
          value: true,
        });
      });

      test('for number 1', () => {
        expect(action['~run']({ typed: true, value: 1 }, {})).toStrictEqual({
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

      test('for boolean false', () => {
        expect(action['~run']({ typed: true, value: false }, {})).toStrictEqual(
          {
            typed: true,
            value: false,
          }
        );
      });

      test('for number 0', () => {
        expect(action['~run']({ typed: true, value: 0 }, {})).toStrictEqual({
          typed: true,
          value: false,
        });
      });
    });
  });

  describe('should handle custom config with `truthy` only', () => {
    describe('for lowercase `truthy` values', () => {
      const action = parseBoolean({
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
      const action = parseBoolean({
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

  describe('should handle custom config with `falsy` only', () => {
    describe('for lowercase `falsy` values', () => {
      const action = parseBoolean({
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
      const action = parseBoolean({
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

  describe('should handle custom config all together', () => {
    const action = parseBoolean({
      truthy: ['YEP'],
      falsy: ['NOPE'],
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

  describe('should handle custom non-string config', () => {
    const action = parseBoolean({
      truthy: [1, true],
      falsy: [0, false, null],
    });

    test('for number 1', () => {
      expect(action['~run']({ typed: true, value: 1 }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for boolean true', () => {
      expect(action['~run']({ typed: true, value: true }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('for number 0', () => {
      expect(action['~run']({ typed: true, value: 0 }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for boolean false', () => {
      expect(action['~run']({ typed: true, value: false }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });

    test('for null', () => {
      expect(action['~run']({ typed: true, value: null }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });
  });

  describe('should return dataset with issues', () => {
    describe('for default config', () => {
      const action = parseBoolean();

      const baseIssue: Omit<
        ParseBooleanIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'parse_boolean',
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
              message: `Invalid boolean: Expected ${defaultExpected} but received symbol`,
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
              message: `Invalid boolean: Expected ${defaultExpected} but received "something"`,
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
              message: `Invalid boolean: Expected ${defaultExpected} but received 123`,
            },
          ],
        });
      });
    });

    describe('for custom config truthy only', () => {
      const action = parseBoolean({
        truthy: ['yep'],
      });

      const baseIssue: Omit<
        ParseBooleanIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'parse_boolean',
        expected:
          '("yep" | false | 0 | "false" | "0" | "no" | "n" | "off" | "disabled")',
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
              message: `Invalid boolean: Expected ${baseIssue.expected} but received "enabled"`,
            },
          ],
        });
      });
    });

    describe('for custom config falsy only', () => {
      const action = parseBoolean({
        falsy: ['nope'],
      });

      const baseIssue: Omit<
        ParseBooleanIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'parse_boolean',
        expected:
          '(true | 1 | "true" | "1" | "yes" | "y" | "on" | "enabled" | "nope")',
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
              message: `Invalid boolean: Expected ${baseIssue.expected} but received "disabled"`,
            },
          ],
        });
      });
    });

    describe('for custom config all together', () => {
      const action = parseBoolean({
        truthy: ['YEP'],
        falsy: ['NOPE'],
      });

      const baseIssue: Omit<
        ParseBooleanIssue<string>,
        'input' | 'received' | 'message'
      > = {
        kind: 'transformation',
        type: 'parse_boolean',
        expected: '("YEP" | "NOPE")',
        requirement: undefined,
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      };

      test('for invalid input as string "something"', () => {
        const value = 'something';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              ...baseIssue,
              input: value,
              received: '"something"',
              message: `Invalid boolean: Expected ${baseIssue.expected} but received "something"`,
            },
          ],
        });
      });
    });

    describe('with custom message', () => {
      test('with string message', () => {
        const action = parseBoolean(undefined, 'custom message');
        const value = 'something';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              kind: 'transformation',
              type: 'parse_boolean',
              expected: defaultExpected,
              input: value,
              received: '"something"',
              message: 'custom message',
              requirement: undefined,
              path: undefined,
              issues: undefined,
              lang: undefined,
              abortEarly: undefined,
              abortPipeEarly: undefined,
            },
          ],
        });
      });

      test('with function message', () => {
        const message = () => 'custom message';
        const action = parseBoolean(undefined, message);
        const value = 'something';

        expect(action['~run']({ typed: true, value }, {})).toStrictEqual({
          typed: false,
          value,
          issues: [
            {
              kind: 'transformation',
              type: 'parse_boolean',
              expected: defaultExpected,
              input: value,
              received: '"something"',
              message: 'custom message',
              requirement: undefined,
              path: undefined,
              issues: undefined,
              lang: undefined,
              abortEarly: undefined,
              abortPipeEarly: undefined,
            },
          ],
        });
      });
    });
  });
});
