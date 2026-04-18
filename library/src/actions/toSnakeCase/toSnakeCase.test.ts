import { describe, expect, test } from 'vitest';
import { toSnakeCase, type ToSnakeCaseAction } from './toSnakeCase.ts';

describe('toSnakeCase', () => {
  test('should return action object', () => {
    expect(toSnakeCase()).toStrictEqual({
      kind: 'transformation',
      type: 'to_snake_case',
      reference: toSnakeCase,
      async: false,
      '~run': expect.any(Function),
    } satisfies ToSnakeCaseAction);
  });

  describe('should transform to snake case', () => {
    const action = toSnakeCase();

    test('for empty string', () => {
      expect(action['~run']({ typed: true, value: '' }, {})).toStrictEqual({
        typed: true,
        value: '',
      });
    });

    test('for single word', () => {
      expect(
        action['~run']({ typed: true, value: 'hello' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello',
      });
    });

    test('for camelCase', () => {
      expect(
        action['~run']({ typed: true, value: 'helloWorld' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello_world',
      });
    });

    test('for snake_case (idempotent)', () => {
      expect(
        action['~run']({ typed: true, value: 'hello_world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello_world',
      });
    });

    test('for kebab-case', () => {
      expect(
        action['~run']({ typed: true, value: 'hello-world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello_world',
      });
    });

    test('for SCREAMING_SNAKE_CASE', () => {
      expect(
        action['~run']({ typed: true, value: 'HELLO_WORLD' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello_world',
      });
    });

    test('for acronym run', () => {
      expect(
        action['~run']({ typed: true, value: 'parseURLValue' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'parse_url_value',
      });
    });

    test('for digit boundary', () => {
      expect(
        action['~run']({ typed: true, value: 'item2Name' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'item2_name',
      });
    });

    test('for leading and trailing separators', () => {
      expect(
        action['~run']({ typed: true, value: '--foo__bar--' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'foo_bar',
      });
    });

    test('for whitespace separators', () => {
      expect(
        action['~run']({ typed: true, value: 'foo\tbar\nbaz' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'foo_bar_baz',
      });
    });
  });
});
