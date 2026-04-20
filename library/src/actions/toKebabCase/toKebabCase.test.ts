import { describe, expect, test } from 'vitest';
import { toKebabCase, type ToKebabCaseAction } from './toKebabCase.ts';

describe('toKebabCase', () => {
  test('should return action object', () => {
    expect(toKebabCase()).toStrictEqual({
      kind: 'transformation',
      type: 'to_kebab_case',
      reference: toKebabCase,
      async: false,
      '~run': expect.any(Function),
    } satisfies ToKebabCaseAction);
  });

  describe('should transform to kebab case', () => {
    const action = toKebabCase();

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
        value: 'hello-world',
      });
    });

    test('for snake_case', () => {
      expect(
        action['~run']({ typed: true, value: 'hello_world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello-world',
      });
    });

    test('for kebab-case (idempotent)', () => {
      expect(
        action['~run']({ typed: true, value: 'hello-world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello-world',
      });
    });

    test('for SCREAMING_SNAKE_CASE', () => {
      expect(
        action['~run']({ typed: true, value: 'HELLO_WORLD' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'hello-world',
      });
    });

    test('for acronym run', () => {
      expect(
        action['~run']({ typed: true, value: 'parseURLValue' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'parse-url-value',
      });
    });

    test('for digit boundary', () => {
      expect(
        action['~run']({ typed: true, value: 'item2Name' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'item2-name',
      });
    });

    test('for leading and trailing separators', () => {
      expect(
        action['~run']({ typed: true, value: '--foo__bar--' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'foo-bar',
      });
    });

    test('for whitespace separators', () => {
      expect(
        action['~run']({ typed: true, value: 'foo\tbar\nbaz' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'foo-bar-baz',
      });
    });
  });
});
