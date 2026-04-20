import { describe, expect, test } from 'vitest';
import { toCamelCase, type ToCamelCaseAction } from './toCamelCase.ts';

describe('toCamelCase', () => {
  test('should return action object', () => {
    expect(toCamelCase()).toStrictEqual({
      kind: 'transformation',
      type: 'to_camel_case',
      reference: toCamelCase,
      async: false,
      '~run': expect.any(Function),
    } satisfies ToCamelCaseAction);
  });

  describe('should transform to camel case', () => {
    const action = toCamelCase();

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

    test('for snake_case', () => {
      expect(
        action['~run']({ typed: true, value: 'hello_world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'helloWorld',
      });
    });

    test('for camelCase (idempotent)', () => {
      expect(
        action['~run']({ typed: true, value: 'helloWorld' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'helloWorld',
      });
    });

    test('for kebab-case', () => {
      expect(
        action['~run']({ typed: true, value: 'hello-world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'helloWorld',
      });
    });

    test('for SCREAMING_SNAKE_CASE', () => {
      expect(
        action['~run']({ typed: true, value: 'HELLO_WORLD' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'helloWorld',
      });
    });

    test('for acronym run', () => {
      expect(
        action['~run']({ typed: true, value: 'parseURLValue' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'parseUrlValue',
      });
    });

    test('for digit boundary', () => {
      expect(
        action['~run']({ typed: true, value: 'item2Name' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'item2Name',
      });
    });

    test('for leading and trailing separators', () => {
      expect(
        action['~run']({ typed: true, value: '--foo__bar--' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'fooBar',
      });
    });

    test('for whitespace separators', () => {
      expect(
        action['~run']({ typed: true, value: 'foo\tbar\nbaz' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'fooBarBaz',
      });
    });
  });
});
