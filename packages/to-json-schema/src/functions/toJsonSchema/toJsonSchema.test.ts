import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { toJsonSchema } from './toJsonSchema.ts';

// TODO: Add tests for override configs

console.warn = vi.fn();

describe('toJsonSchema', () => {
  describe('should convert schema', () => {
    test('for simple string schema', () => {
      expect(toJsonSchema(v.string())).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
      });
    });

    test('for complex schema with definitions', () => {
      const stringSchema = v.string();
      const complexSchema = v.pipe(
        v.object({
          name: v.lazy(() => stringSchema),
          email: v.pipe(stringSchema, v.email(), v.minLength(10)),
          age: v.optional(v.number()),
        }),
        v.description('foo')
      );
      expect(
        toJsonSchema(complexSchema, {
          definitions: { stringSchema, complexSchema },
        })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/$defs/complexSchema',
        $defs: {
          stringSchema: { type: 'string' },
          complexSchema: {
            type: 'object',
            properties: {
              name: { $ref: '#/$defs/stringSchema' },
              email: { type: 'string', format: 'email', minLength: 10 },
              age: { type: 'number' },
            },
            required: ['name', 'email'],
            description: 'foo',
          },
        },
      });
    });

    test('for complex schema with any order of definitions', () => {
      const stringSchema = v.string();
      const aliasesSchema = v.array(stringSchema);
      const complexSchema = v.pipe(
        v.object({
          name: v.lazy(() => stringSchema),
          aliases: v.optional(aliasesSchema),
          email: v.pipe(stringSchema, v.email(), v.minLength(10)),
        }),
        v.description('foo')
      );
      const expectedJsonSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/$defs/complexSchema',
        $defs: {
          stringSchema: { type: 'string' },
          aliasesSchema: {
            type: 'array',
            items: { $ref: '#/$defs/stringSchema' },
          },
          complexSchema: {
            type: 'object',
            properties: {
              name: { $ref: '#/$defs/stringSchema' },
              aliases: { $ref: '#/$defs/aliasesSchema' },
              email: { type: 'string', format: 'email', minLength: 10 },
            },
            required: ['name', 'email'],
            description: 'foo',
          },
        },
      };
      const definitionPermutations = [
        { stringSchema, aliasesSchema, complexSchema },
        { stringSchema, complexSchema, aliasesSchema },
        { aliasesSchema, stringSchema, complexSchema },
        { aliasesSchema, complexSchema, stringSchema },
        { complexSchema, stringSchema, aliasesSchema },
        { complexSchema, aliasesSchema, stringSchema },
      ];
      for (const definitions of definitionPermutations) {
        expect(toJsonSchema(complexSchema, { definitions })).toStrictEqual(
          expectedJsonSchema
        );
      }
    });

    test('for recursive schema', () => {
      const ul = v.object({
        type: v.literal('ul'),
        children: v.array(v.lazy(() => li)),
      });
      const li: v.GenericSchema = v.object({
        type: v.literal('li'),
        children: v.array(v.union([v.string(), ul])),
      });
      expect(
        toJsonSchema(ul, {
          definitions: { ul, li },
        })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/$defs/ul',
        $defs: {
          ul: {
            properties: {
              children: {
                items: { $ref: '#/$defs/li' },
                type: 'array',
              },
              type: { const: 'ul' },
            },
            required: ['type', 'children'],
            type: 'object',
          },
          li: {
            properties: {
              children: {
                items: {
                  anyOf: [{ type: 'string' }, { $ref: '#/$defs/ul' }],
                },
                type: 'array',
              },
              type: { const: 'li' },
            },
            required: ['type', 'children'],
            type: 'object',
          },
        },
      });
    });
  });

  describe('should throw error', () => {
    test('for invalid file schema', () => {
      expect(() => toJsonSchema(v.file())).toThrowError(
        'The "file" schema cannot be converted to JSON Schema.'
      );
      expect(() => toJsonSchema(v.file(), { errorMode: 'throw' })).toThrowError(
        'The "file" schema cannot be converted to JSON Schema.'
      );
    });

    test('for invalid credit card action', () => {
      expect(() =>
        toJsonSchema(v.pipe(v.string(), v.creditCard()))
      ).toThrowError(
        'The "credit_card" action cannot be converted to JSON Schema.'
      );
      expect(() =>
        toJsonSchema(v.pipe(v.string(), v.creditCard()), { errorMode: 'throw' })
      ).toThrowError(
        'The "credit_card" action cannot be converted to JSON Schema.'
      );
    });
  });

  describe('should warn error', () => {
    test('for invalid file schema', () => {
      expect(toJsonSchema(v.file(), { errorMode: 'warn' })).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
      });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The "file" schema cannot be converted to JSON Schema.'
      );
    });

    test('for invalid credit card action', () => {
      expect(
        toJsonSchema(v.pipe(v.string(), v.creditCard()), { errorMode: 'warn' })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
      });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The "credit_card" action cannot be converted to JSON Schema.'
      );
    });
  });

  describe('should ignore error', () => {
    test('for invalid file schema', () => {
      expect(toJsonSchema(v.file(), { errorMode: 'ignore' })).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
      });
    });

    test('for invalid credit card action', () => {
      expect(
        toJsonSchema(v.pipe(v.string(), v.creditCard()), {
          errorMode: 'ignore',
        })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
      });
    });
  });

  describe('should handle target config', () => {
    test('for draft-07', () => {
      expect(toJsonSchema(v.string(), { target: 'draft-07' })).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
      });
    });

    test('for draft-2020-12', () => {
      expect(
        toJsonSchema(v.string(), { target: 'draft-2020-12' })
      ).toStrictEqual({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'string',
      });
    });

    test('for openapi-3.0', () => {
      expect(toJsonSchema(v.string(), { target: 'openapi-3.0' })).toStrictEqual(
        {
          type: 'string',
        }
      );
    });
  });
});
