import { describe, expect, test } from 'vitest';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { pojo, type PojoIssue, type PojoSchema } from './pojo.ts';

describe('pojo', () => {
  describe('should return schema object', () => {
    const baseSchema: Omit<PojoSchema<never>, 'message'> = {
      kind: 'schema',
      type: 'pojo',
      reference: pojo,
      expects: 'Object',
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      expect(pojo()).toEqual(baseSchema);
      expect(pojo(undefined)).toEqual(baseSchema);
    });

    test('with string message', () => {
      expect(pojo('message')).toEqual({ ...baseSchema, message: 'message' });
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(pojo(message)).toEqual({ ...baseSchema, message });
    });
  });

  describe('should return dataset without issues', () => {
    const schema = pojo();

    test('for plain object', () => {
      expectNoSchemaIssue(schema, [{}, { key: 'value' }]);
    });
  });

  describe('should return dataset with issues', () => {
    const schema = pojo('message');
    const baseIssue: Omit<PojoIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'pojo',
      expected: 'Object',
      message: 'message',
    };

    // Primitive types

    test('for bigints', () => {
      expectSchemaIssue(schema, baseIssue, [-1n, 0n, 123n]);
    });

    test('for booleans', () => {
      expectSchemaIssue(schema, baseIssue, [true, false]);
    });

    test('for null', () => {
      expectSchemaIssue(schema, baseIssue, [null]);
    });

    test('for numbers', () => {
      expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
    });

    test('for undefined', () => {
      expectSchemaIssue(schema, baseIssue, [undefined]);
    });

    test('for strings', () => {
      expectSchemaIssue(schema, baseIssue, ['', 'foo', '123']);
    });

    test('for symbols', () => {
      expectSchemaIssue(schema, baseIssue, [Symbol(), Symbol('foo')]);
    });

    // Complex types

    test('for arrays', () => {
      expectSchemaIssue(schema, baseIssue, [[], ['value']]);
    });

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
    });
  });
});
