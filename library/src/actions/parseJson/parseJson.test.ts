import { describe, expect, test } from 'vitest';
import {
  parseJson,
  type ParseJsonAction,
  type ParseJsonConfig,
  type ParseJsonIssue,
} from './parseJson.ts';

describe('parseJson', () => {
  describe('should return action object', () => {
    const config: ParseJsonConfig = {
      reviver: (key, value) => value,
    };
    const baseAction: Omit<
      ParseJsonAction<string, never, never>,
      'message' | 'config'
    > = {
      kind: 'transformation',
      type: 'parse_json',
      reference: parseJson,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined config and undefined message', () => {
      const action: ParseJsonAction<string, undefined, undefined> = {
        ...baseAction,
        config: undefined,
        message: undefined,
      };
      expect(parseJson()).toStrictEqual(action);
      expect(parseJson(undefined)).toStrictEqual(action);
      expect(parseJson(undefined, undefined)).toStrictEqual(action);
    });

    test('with undefined config and string message', () => {
      expect(parseJson(undefined, 'message')).toStrictEqual({
        ...baseAction,
        config: undefined,
        message: 'message',
      } satisfies ParseJsonAction<string, undefined, 'message'>);
    });

    test('with undefined config and function message', () => {
      const message = () => 'message';
      expect(parseJson(undefined, message)).toStrictEqual({
        ...baseAction,
        config: undefined,
        message,
      } satisfies ParseJsonAction<string, undefined, () => string>);
    });

    test('with config and undefined message', () => {
      const action: ParseJsonAction<string, typeof config, undefined> = {
        ...baseAction,
        config,
        message: undefined,
      };
      expect(parseJson(config)).toStrictEqual(action);
      expect(parseJson(config, undefined)).toStrictEqual(action);
    });

    test('with config and string message', () => {
      expect(parseJson(config, 'message')).toStrictEqual({
        ...baseAction,
        config,
        message: 'message',
      } satisfies ParseJsonAction<string, typeof config, 'message'>);
    });

    test('with config and function message', () => {
      const message = () => 'message';
      expect(parseJson(config, message)).toStrictEqual({
        ...baseAction,
        config,
        message,
      } satisfies ParseJsonAction<string, typeof config, () => string>);
    });
  });

  describe('should convert JSON string into JSON data', () => {
    const input = '{"foo":"bar"}';

    test('without config', () => {
      expect(
        parseJson()['~run']({ typed: true, value: input }, {})
      ).toStrictEqual({
        typed: true,
        value: { foo: 'bar' },
      });
    });

    test('with reviver', () => {
      expect(
        parseJson({
          reviver: (key, value) =>
            typeof value === 'string' ? value.toUpperCase() : value,
        })['~run']({ typed: true, value: input }, {})
      ).toStrictEqual({
        typed: true,
        value: { foo: 'BAR' },
      });
    });
  });

  describe('should return dataset with issues', () => {
    const action = parseJson(undefined, 'message');
    const baseIssue: Omit<ParseJsonIssue<string>, 'input' | 'received'> = {
      kind: 'transformation',
      type: 'parse_json',
      expected: null,
      message: 'message',
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for normal text', () => {
      const input = 'foo';
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseIssue,
            input,
            received: `"Unexpected token 'o', "foo" is not valid JSON"`,
          } satisfies ParseJsonIssue<string>,
        ],
      });
    });

    test('for invalid JSON string', () => {
      const input = '{"foo":20n}';
      expect(action['~run']({ typed: true, value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseIssue,
            input,
            received: expect.toBeOneOf([
              `"Expected ',' or '}' after property value in JSON at position 9"`,
              `"Expected ',' or '}' after property value in JSON at position 9 (line 1 column 10)"`,
            ]),
          } satisfies ParseJsonIssue<string>,
        ],
      });
    });
  });

  describe('should throw non-Error exceptions', () => {
    test('for non-Error thrown by reviver', () => {
      const action = parseJson({
        reviver: () => {
          throw 'custom string error';
        },
      });
      expect(() => action['~run']({ typed: true, value: '{}' }, {})).toThrow(
        'custom string error'
      );
    });
  });
});
