import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { toStandardJsonSchema } from './toStandardJsonSchema.ts';

describe('toStandardJsonSchema', () => {
  const schema = v.pipe(
    v.string(),
    v.decimal(),
    v.toNumber(),
    v.number(),
    v.minValue(10)
  );

  describe('should return schema object', () => {
    test('with string schema', () => {
      const result = toStandardJsonSchema(schema);

      expect(result).toStrictEqual({
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
          jsonSchema: {
            input: expect.any(Function),
            output: expect.any(Function),
          },
        },
      });
    });
  });

  describe('should throw error for unsupported target', () => {
    test('throws error for input conversion with unsupported target', () => {
      const result = toStandardJsonSchema(schema);

      expect(() =>
        result['~standard'].jsonSchema.input({
          target: 'unsupported-target',
        })
      ).toThrowError('Unsupported target: unsupported-target');
    });

    test('throws error for output conversion with unsupported target', () => {
      const result = toStandardJsonSchema(schema);

      expect(() =>
        result['~standard'].jsonSchema.output({
          target: 'unsupported-target',
        })
      ).toThrowError('Unsupported target: unsupported-target');
    });
  });

  describe('should convert schema to JSON Schema', () => {
    test('converts schema to input JSON Schema', () => {
      const result = toStandardJsonSchema(schema);

      const jsonSchema = result['~standard'].jsonSchema.input({
        target: 'draft-07',
      });

      expect(jsonSchema).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        pattern: '^[+-]?(?:\\d*\\.)?\\d+$',
      });
    });

    test('converts schema to output JSON Schema', () => {
      const result = toStandardJsonSchema(schema);

      const jsonSchema = result['~standard'].jsonSchema.output({
        target: 'draft-07',
      });

      expect(jsonSchema).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'number',
        minimum: 10,
      });
    });
  });
});
