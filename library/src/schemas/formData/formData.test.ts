import { describe, expect, test } from 'vitest';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import {
  formData,
  type FormDataIssue,
  type FormDataSchema,
} from './formData.ts';

describe('formData', () => {
  describe('should return schema object', () => {
    const baseSchema: Omit<FormDataSchema<never>, 'message'> = {
      kind: 'schema',
      type: 'form_data',
      reference: formData,
      expects: 'FormData',
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: FormDataSchema<undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(formData()).toStrictEqual(schema);
      expect(formData(undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(formData('message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies FormDataSchema<'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(formData(message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies FormDataSchema<typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const schema = formData();

    test('for FormData objects', () => {
      const filled = new FormData();
      filled.append('foo', 'bar');

      expectNoSchemaIssue(schema, [new FormData(), filled]);
    });
  });

  describe('should return dataset with issues', () => {
    const schema = formData('message');
    const baseIssue: Omit<FormDataIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'form_data',
      expected: 'FormData',
      message: 'message',
    };

    // Special values

    test('for blobs', () => {
      expectSchemaIssue(schema, baseIssue, [new Blob(), new Blob(['foo'])]);
    });

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

    test('for objects', () => {
      expectSchemaIssue(schema, baseIssue, [{}, { key: 'value' }]);
    });
  });
});
