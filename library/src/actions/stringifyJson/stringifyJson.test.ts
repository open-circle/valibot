import { describe, expect, test } from 'vitest';
import {
  stringifyJson,
  type StringifyJsonAction,
  type StringifyJsonConfig,
  type StringifyJsonIssue,
} from './stringifyJson.ts';

describe('stringifyJson', () => {
  describe('should return action object', () => {
    const config: StringifyJsonConfig = {
      replacer: (key, value) => value,
    };
    const baseAction: Omit<
      StringifyJsonAction<unknown, never, never>,
      'message' | 'config'
    > = {
      kind: 'transformation',
      type: 'stringify_json',
      reference: stringifyJson,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined config and undefined message', () => {
      const action: StringifyJsonAction<unknown, undefined, undefined> = {
        ...baseAction,
        config: undefined,
        message: undefined,
      };
      expect(stringifyJson()).toStrictEqual(action);
      expect(stringifyJson(undefined)).toStrictEqual(action);
      expect(stringifyJson(undefined, undefined)).toStrictEqual(action);
    });

    test('with undefined config and string message', () => {
      expect(stringifyJson(undefined, 'message')).toStrictEqual({
        ...baseAction,
        config: undefined,
        message: 'message',
      } satisfies StringifyJsonAction<unknown, undefined, 'message'>);
    });

    test('with undefined config and function message', () => {
      const message = () => 'message';
      expect(stringifyJson(undefined, message)).toStrictEqual({
        ...baseAction,
        config: undefined,
        message,
      } satisfies StringifyJsonAction<unknown, undefined, () => string>);
    });

    test('with config and undefined message', () => {
      const action: StringifyJsonAction<
        unknown,
        StringifyJsonConfig,
        undefined
      > = {
        ...baseAction,
        config,
        message: undefined,
      };
      expect(stringifyJson(config)).toStrictEqual(action);
      expect(stringifyJson(config, undefined)).toStrictEqual(action);
    });

    test('with config and string message', () => {
      expect(stringifyJson(config, 'message')).toStrictEqual({
        ...baseAction,
        config,
        message: 'message',
      } satisfies StringifyJsonAction<unknown, StringifyJsonConfig, 'message'>);
    });

    test('with config and function message', () => {
      const message = () => 'message';
      expect(stringifyJson(config, message)).toStrictEqual({
        ...baseAction,
        config,
        message,
      } satisfies StringifyJsonAction<
        unknown,
        StringifyJsonConfig,
        () => string
      >);
    });
  });

  describe('should convert JSON date into JSON string', () => {
    test('without config', () => {
      expect(
        stringifyJson()['~run']({ typed: true, value: { foo: 'bar' } }, {})
      ).toStrictEqual({
        typed: true,
        value: '{"foo":"bar"}',
      });
    });

    test('with replacer', () => {
      expect(
        stringifyJson({
          replacer: (key, value) =>
            typeof value === 'string' ? value.toUpperCase() : value,
        })['~run']({ typed: true, value: { foo: 'bar' } }, {})
      ).toStrictEqual({
        typed: true,
        value: '{"foo":"BAR"}',
      });
    });

    test('with space', () => {
      expect(
        stringifyJson({ space: 2 })['~run'](
          { typed: true, value: { foo: 'bar' } },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: '{\n  "foo": "bar"\n}',
      });
    });

    test('for nested undefined', () => {
      expect(
        stringifyJson()['~run']({ typed: true, value: { foo: undefined } }, {})
      ).toStrictEqual({
        typed: true,
        value: '{}',
      });
    });

    test('for nested function', () => {
      expect(
        stringifyJson()['~run']({ typed: true, value: { foo: () => null } }, {})
      ).toStrictEqual({
        typed: true,
        value: '{}',
      });
    });
  });

  describe('should return dataset with issues', () => {
    const action = stringifyJson(undefined, 'message');
    const baseIssue: Omit<StringifyJsonIssue<unknown>, 'input' | 'received'> = {
      kind: 'transformation',
      type: 'stringify_json',
      expected: null,
      message: 'message',
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for undefined input', () => {
      const input = undefined;
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseIssue,
            input,
            received: 'undefined',
          },
        ],
      });
    });

    test('for bigint input', () => {
      const input = 123n;
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseIssue,
            input,
            received: '"Do not know how to serialize a BigInt"',
          },
        ],
      });
    });

    test('for nested bigint', () => {
      const input = { foo: 123n };
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseIssue,
            input,
            received: '"Do not know how to serialize a BigInt"',
          },
        ],
      });
    });

    test('for function input', () => {
      const input = () => null;
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: undefined,
        issues: [
          {
            ...baseIssue,
            input,
            received: 'Function',
          },
        ],
      });
    });

    test('for circular dependency', () => {
      const input = { foo: null as unknown };
      input.foo = input;
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseIssue,
            input,
            received: `"Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'foo' closes the circle"`,
          },
        ],
      });
    });
  });

  describe('should throw non-Error exceptions', () => {
    test('for non-Error thrown by replacer', () => {
      const action = stringifyJson({
        replacer: () => {
          throw 'custom string error';
        },
      });
      expect(() =>
        action['~run']({ typed: true, value: { foo: 'bar' } }, {})
      ).toThrow('custom string error');
    });
  });
});
