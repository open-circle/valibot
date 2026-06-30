import { describe, expect, test } from 'vitest';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { literal, type LiteralIssue, type LiteralSchema } from './literal.ts';

describe('literal', () => {
  describe('should return schema object', () => {
    const baseSchema: Omit<LiteralSchema<123, never>, 'message'> = {
      kind: 'schema',
      type: 'literal',
      reference: literal,
      literal: 123,
      expects: '123',
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: LiteralSchema<123, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(literal(123)).toStrictEqual(schema);
      expect(literal(123, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(literal(123, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies LiteralSchema<123, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(literal(123, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies LiteralSchema<123, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for valid bigint literal', () => {
      expectNoSchemaIssue(literal(-1n), [-1n]);
      expectNoSchemaIssue(literal(0n), [0n]);
      expectNoSchemaIssue(literal(123n), [123n]);
    });

    test('for valid boolean literal', () => {
      expectNoSchemaIssue(literal(true), [true]);
      expectNoSchemaIssue(literal(false), [false]);
    });

    test('for valid number literal', () => {
      expectNoSchemaIssue(literal(-1), [-1]);
      expectNoSchemaIssue(literal(0), [0]);
      expectNoSchemaIssue(literal(123), [123]);
      expectNoSchemaIssue(literal(45.67), [45.67]);
    });

    test('for valid NaN literal', () => {
      expectNoSchemaIssue(literal(NaN), [NaN]);
    });

    test('for valid string literal', () => {
      expectNoSchemaIssue(literal(''), ['']);
      expectNoSchemaIssue(literal('foo'), ['foo']);
      expectNoSchemaIssue(literal('123'), ['123']);
    });

    test('for valid symbol literal', () => {
      const symbol1 = Symbol();
      expectNoSchemaIssue(literal(symbol1), [symbol1]);
      const symbol2 = Symbol('foo');
      expectNoSchemaIssue(literal(symbol2), [symbol2]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseIssue: Omit<LiteralIssue, 'input' | 'expected' | 'received'> = {
      kind: 'schema',
      type: 'literal',
      message: 'message',
    };

    test('for invalid bigint literal', () => {
      expectSchemaIssue(
        literal(123n, 'message'),
        { ...baseIssue, expected: '123' },
        [
          -1n,
          0n,
          132n,
          true,
          false,
          null,
          123,
          undefined,
          '123',
          Symbol('123'),
          {},
          [],
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
        ]
      );
    });

    test('for invalid boolean literal', () => {
      expectSchemaIssue(
        literal(false, 'message'),
        { ...baseIssue, expected: 'false' },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        [0n, true, null, 0, undefined, '', Symbol(), {}, [], () => {}]
      );
    });

    test('for invalid number literal', () => {
      expectSchemaIssue(
        literal(123, 'message'),
        { ...baseIssue, expected: '123' },
        [
          123n,
          true,
          false,
          null,
          -123,
          0,
          45.67,
          undefined,
          '123',
          Symbol('123'),
          {},
          [],
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
        ]
      );
    });

    test('for invalid string literal', () => {
      expectSchemaIssue(
        literal('123', 'message'),
        { ...baseIssue, expected: '"123"' },
        [
          123n,
          true,
          false,
          null,
          -123,
          undefined,
          '',
          'foo',
          Symbol('123'),
          {},
          [],
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
        ]
      );
    });

    test('for invalid symbol literal', () => {
      expectSchemaIssue(
        literal(Symbol('123'), 'message'),
        { ...baseIssue, expected: 'symbol' },
        [
          123n,
          true,
          false,
          null,
          -123,
          undefined,
          '123',
          Symbol(),
          {},
          [],
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
        ]
      );
    });
  });
});
