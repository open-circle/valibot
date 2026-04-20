import { describe, expect, test } from 'vitest';
import { toPascalCase, type ToPascalCaseAction } from './toPascalCase.ts';

describe('toPascalCase', () => {
  test('should return action object', () => {
    expect(toPascalCase()).toStrictEqual({
      kind: 'transformation',
      type: 'to_pascal_case',
      reference: toPascalCase,
      async: false,
      '~run': expect.any(Function),
    } satisfies ToPascalCaseAction);
  });

  describe('should transform to pascal case', () => {
    const action = toPascalCase();

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
        value: 'Hello',
      });
    });

    test('for snake_case', () => {
      expect(
        action['~run']({ typed: true, value: 'hello_world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'HelloWorld',
      });
    });

    test('for camelCase', () => {
      expect(
        action['~run']({ typed: true, value: 'helloWorld' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'HelloWorld',
      });
    });

    test('for kebab-case', () => {
      expect(
        action['~run']({ typed: true, value: 'hello-world' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'HelloWorld',
      });
    });

    test('for SCREAMING_SNAKE_CASE', () => {
      expect(
        action['~run']({ typed: true, value: 'HELLO_WORLD' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'HelloWorld',
      });
    });

    test('for acronym run', () => {
      expect(
        action['~run']({ typed: true, value: 'parseURLValue' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'ParseUrlValue',
      });
    });

    test('for digit boundary', () => {
      expect(
        action['~run']({ typed: true, value: 'item2Name' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'Item2Name',
      });
    });

    test('for leading and trailing separators', () => {
      expect(
        action['~run']({ typed: true, value: '--foo__bar--' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'FooBar',
      });
    });

    test('for whitespace separators', () => {
      expect(
        action['~run']({ typed: true, value: 'foo\tbar\nbaz' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'FooBarBaz',
      });
    });
  });
});
