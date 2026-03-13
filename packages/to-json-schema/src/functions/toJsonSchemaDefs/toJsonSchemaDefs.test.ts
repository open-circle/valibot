import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { toJsonSchemaDefs } from './toJsonSchemaDefs.ts';

// TODO: Add tests for override configs

console.warn = vi.fn();

describe('toJsonSchemaDefs', () => {
  describe('should convert schema', () => {
    test('for simple schema', () => {
      expect(
        toJsonSchemaDefs({ foo: v.string(), bar: v.number() })
      ).toStrictEqual({
        foo: { type: 'string' },
        bar: { type: 'number' },
      });
    });

    test('for complex schema with linked definitions', () => {
      const stringSchema = v.string();
      const complexSchema = v.pipe(
        v.object({
          name: v.lazy(() => stringSchema),
          email: v.pipe(stringSchema, v.email(), v.minLength(10)),
          age: v.optional(v.number()),
        }),
        v.description('foo')
      );
      expect(toJsonSchemaDefs({ stringSchema, complexSchema })).toStrictEqual({
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
      });
    });

    test('for complex schema with any order of linked definitions', () => {
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
      const expectedJsonSchemaDefs = {
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
        expect(toJsonSchemaDefs(definitions)).toStrictEqual(
          expectedJsonSchemaDefs
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
      expect(toJsonSchemaDefs({ ul, li })).toStrictEqual({
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
      });
    });
  });

  describe('should throw error', () => {
    test('for invalid file schema', () => {
      expect(() => toJsonSchemaDefs({ foo: v.file() })).toThrowError(
        'The "file" schema cannot be converted to JSON Schema.'
      );
      expect(() =>
        toJsonSchemaDefs({ foo: v.file() }, { errorMode: 'throw' })
      ).toThrowError('The "file" schema cannot be converted to JSON Schema.');
    });

    test('for invalid credit card action', () => {
      expect(() =>
        toJsonSchemaDefs({ foo: v.pipe(v.string(), v.creditCard()) })
      ).toThrowError(
        'The "credit_card" action cannot be converted to JSON Schema.'
      );
      expect(() =>
        toJsonSchemaDefs(
          { foo: v.pipe(v.string(), v.creditCard()) },
          { errorMode: 'throw' }
        )
      ).toThrowError(
        'The "credit_card" action cannot be converted to JSON Schema.'
      );
    });
  });

  describe('should warn error', () => {
    test('for invalid file schema', () => {
      expect(
        toJsonSchemaDefs({ foo: v.file() }, { errorMode: 'warn' })
      ).toStrictEqual({ foo: {} });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The "file" schema cannot be converted to JSON Schema.'
      );
    });

    test('for invalid credit card action', () => {
      expect(
        toJsonSchemaDefs(
          { foo: v.pipe(v.string(), v.creditCard()) },
          { errorMode: 'warn' }
        )
      ).toStrictEqual({ foo: { type: 'string' } });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The "credit_card" action cannot be converted to JSON Schema.'
      );
    });
  });

  describe('should ignore error', () => {
    test('for invalid file schema', () => {
      expect(
        toJsonSchemaDefs({ foo: v.file() }, { errorMode: 'ignore' })
      ).toStrictEqual({ foo: {} });
    });

    test('for invalid credit card action', () => {
      expect(
        toJsonSchemaDefs(
          { foo: v.pipe(v.string(), v.creditCard()) },
          { errorMode: 'ignore' }
        )
      ).toStrictEqual({ foo: { type: 'string' } });
    });
  });
});
