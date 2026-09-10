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

    test('for recursive schema without definitions on repeated calls', () => {
      const nodeSchema: v.GenericSchema = v.object({
        child: v.optional(v.lazy(() => nodeSchema)),
      });
      const expectedJsonSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: { child: { $ref: '#/$defs/0' } },
        required: [],
        $defs: {
          '0': {
            type: 'object',
            properties: { child: { $ref: '#/$defs/0' } },
            required: [],
          },
        },
      };
      expect(toJsonSchema(nodeSchema)).toStrictEqual(expectedJsonSchema);
      expect(toJsonSchema(nodeSchema)).toStrictEqual(expectedJsonSchema);
    });

    test('for lazy schema with multiple definitions of same schema', () => {
      const stringSchema = v.string();
      const numberSchema = v.number();
      const lazySchema = v.lazy(() => stringSchema);
      expect(
        toJsonSchema(lazySchema, {
          definitions: {
            '0': lazySchema,
            '1': numberSchema,
            '2': numberSchema,
          },
        })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/$defs/0',
        $defs: {
          '0': { $ref: '#/$defs/3' },
          '1': { type: 'number' },
          '2': { type: 'number' },
          '3': { type: 'string' },
        },
      });
    });

    test('for overrides with only previously converted definitions', () => {
      const stringSchema = v.string();
      const numberSchema = v.number();
      expect(
        toJsonSchema(stringSchema, {
          definitions: { stringSchema, numberSchema },
          overrideSchema(context) {
            if (context.valibotSchema === stringSchema) {
              expect(context.definitions).toStrictEqual({});
            } else if (context.valibotSchema === numberSchema) {
              expect(context.definitions).toStrictEqual({
                stringSchema: { type: 'string' },
              });
            }
            return null;
          },
        })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/$defs/stringSchema',
        $defs: {
          stringSchema: { type: 'string' },
          numberSchema: { type: 'number' },
        },
      });
    });

    test('for lazy schemas with definition added by override', () => {
      const stringSchema = v.string();
      const numberSchema = v.number();
      expect(
        toJsonSchema(
          v.object({
            foo: v.lazy(() => stringSchema),
            bar: v.lazy(() => numberSchema),
          }),
          {
            overrideSchema(context) {
              if (context.valibotSchema === stringSchema) {
                context.definitions['1'] = { type: 'boolean' };
              }
              return null;
            },
          }
        )
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          foo: { $ref: '#/$defs/0' },
          bar: { $ref: '#/$defs/2' },
        },
        required: ['foo', 'bar'],
        $defs: {
          '0': { type: 'string' },
          '1': { type: 'boolean' },
          '2': { type: 'number' },
        },
      });
    });

    test('for lazy schemas with conversion inside override', () => {
      const stringSchema = v.string();
      const numberSchema = v.number();
      expect(
        toJsonSchema(
          v.object({
            foo: v.lazy(() => stringSchema),
            bar: v.lazy(() => numberSchema),
          }),
          {
            overrideSchema(context) {
              if (context.valibotSchema === stringSchema) {
                // A nested conversion must not reset the outer reference counter.
                toJsonSchema(v.boolean());
              }
              return null;
            },
          }
        )
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          foo: { $ref: '#/$defs/0' },
          bar: { $ref: '#/$defs/1' },
        },
        required: ['foo', 'bar'],
        $defs: {
          '0': { type: 'string' },
          '1': { type: 'number' },
        },
      });
    });

    test('for lazy schemas with reference added by override', () => {
      const stringSchema = v.string();
      const numberSchema = v.number();
      const booleanSchema = v.boolean();
      expect(
        toJsonSchema(
          v.object({
            foo: v.lazy(() => stringSchema),
            bar: v.lazy(() => numberSchema),
            baz: booleanSchema,
          }),
          {
            overrideSchema(context) {
              if (context.valibotSchema === stringSchema) {
                // Reserve a reference before its definition is created.
                context.referenceMap.set(booleanSchema, '1');
              } else if (context.valibotSchema === numberSchema) {
                context.definitions['1'] = { type: 'boolean' };
              }
              return null;
            },
          }
        )
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          foo: { $ref: '#/$defs/0' },
          bar: { $ref: '#/$defs/2' },
          baz: { $ref: '#/$defs/1' },
        },
        required: ['foo', 'bar', 'baz'],
        $defs: {
          '0': { type: 'string' },
          '1': { type: 'boolean' },
          '2': { type: 'number' },
        },
      });
    });

    test('for lazy schemas with reference replaced by override', () => {
      const stringSchema = v.string();
      const numberSchema = v.number();
      const booleanSchema = v.boolean();
      expect(
        toJsonSchema(
          v.object({
            foo: v.lazy(() => stringSchema),
            bar: v.lazy(() => numberSchema),
            baz: booleanSchema,
          }),
          {
            definitions: { booleanSchema },
            overrideRef(context) {
              if (context.valibotSchema === stringSchema) {
                // Replacing a reference does not change the map's size.
                context.referenceMap.set(booleanSchema, '1');
              } else if (context.valibotSchema === numberSchema) {
                context.definitions['1'] = { type: 'boolean' };
              }
              return undefined;
            },
          }
        )
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          foo: { $ref: '#/$defs/0' },
          bar: { $ref: '#/$defs/2' },
          baz: { $ref: '#/$defs/1' },
        },
        required: ['foo', 'bar', 'baz'],
        $defs: {
          booleanSchema: { type: 'boolean' },
          '0': { type: 'string' },
          '1': { type: 'boolean' },
          '2': { type: 'number' },
        },
      });
    });

    test('for definitions with JSON Pointer special characters', () => {
      const sharedSchema = v.object({ name: v.string() });
      expect(
        toJsonSchema(v.object({ user: sharedSchema }), {
          definitions: { 'Shared/User~': sharedSchema },
        })
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          user: { $ref: '#/$defs/Shared~1User~0' },
        },
        required: ['user'],
        $defs: {
          'Shared/User~': {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            required: ['name'],
          },
        },
      });
    });
  });

  describe('should throw error', () => {
    test('for impossible numeric bounds before safe integer', () => {
      expect(() =>
        toJsonSchema(v.pipe(v.number(), v.minValue(Infinity), v.safeInteger()))
      ).toThrowError(
        'The requirement of the "min_value" action is not JSON compatible.'
      );
      expect(() =>
        toJsonSchema(v.pipe(v.number(), v.maxValue(-Infinity), v.safeInteger()))
      ).toThrowError(
        'The requirement of the "max_value" action is not JSON compatible.'
      );
    });

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

  describe('should keep stricter bound when actions overlap', () => {
    test('for repeated numeric bounds in either order', () => {
      for (const schema of [
        v.pipe(
          v.number(),
          v.minValue(-1),
          v.minValue(0),
          v.maxValue(1),
          v.maxValue(0)
        ),
        v.pipe(
          v.number(),
          v.minValue(0),
          v.minValue(-1),
          v.maxValue(0),
          v.maxValue(1)
        ),
        v.pipe(
          v.number(),
          v.minValue(0),
          v.minValue(0),
          v.maxValue(0),
          v.maxValue(0)
        ),
      ]) {
        expect(toJsonSchema(schema)).toStrictEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'number',
          minimum: 0,
          maximum: 0,
        });
      }
    });

    test('for repeated exclusive bounds in either order', () => {
      for (const schema of [
        v.pipe(
          v.number(),
          v.gtValue(-1),
          v.gtValue(0),
          v.ltValue(2),
          v.ltValue(1)
        ),
        v.pipe(
          v.number(),
          v.gtValue(0),
          v.gtValue(-1),
          v.ltValue(1),
          v.ltValue(2)
        ),
      ]) {
        expect(toJsonSchema(schema)).toStrictEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'number',
          exclusiveMinimum: 0,
          exclusiveMaximum: 1,
        });
      }
    });

    test('for contradictory string lengths in either order', () => {
      for (const schema of [
        v.pipe(v.string(), v.length(2), v.length(3)),
        v.pipe(v.string(), v.length(3), v.length(2)),
      ]) {
        expect(toJsonSchema(schema)).toStrictEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
          minLength: 3,
          maxLength: 2,
        });
      }
    });

    test('for contradictory array lengths in either order', () => {
      for (const schema of [
        v.pipe(v.array(v.number()), v.length(2), v.length(3)),
        v.pipe(v.array(v.number()), v.length(3), v.length(2)),
      ]) {
        expect(toJsonSchema(schema)).toStrictEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 2,
        });
      }
    });

    test('for contradictory entry counts in either order', () => {
      for (const schema of [
        v.pipe(v.record(v.string(), v.number()), v.entries(2), v.entries(3)),
        v.pipe(v.record(v.string(), v.number()), v.entries(3), v.entries(2)),
      ]) {
        expect(toJsonSchema(schema)).toStrictEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          additionalProperties: { type: 'number' },
          propertyNames: { type: 'string' },
          minProperties: 3,
          maxProperties: 2,
        });
      }
    });

    test('for safe integer and numeric bounds in either order', () => {
      for (const schema of [
        v.pipe(
          v.number(),
          v.safeInteger(),
          v.minValue(Number.MIN_SAFE_INTEGER - 1),
          v.maxValue(Number.MAX_SAFE_INTEGER + 1)
        ),
        v.pipe(
          v.number(),
          v.minValue(Number.MIN_SAFE_INTEGER - 1),
          v.maxValue(Number.MAX_SAFE_INTEGER + 1),
          v.safeInteger()
        ),
      ]) {
        expect(toJsonSchema(schema)).toStrictEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'integer',
          minimum: Number.MIN_SAFE_INTEGER,
          maximum: Number.MAX_SAFE_INTEGER,
        });
      }
    });

    test('for non empty after min length', () => {
      expect(
        toJsonSchema(v.pipe(v.string(), v.minLength(3), v.nonEmpty()))
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        minLength: 3,
      });
    });

    test('for repeated min value actions', () => {
      expect(
        toJsonSchema(v.pipe(v.number(), v.minValue(5), v.minValue(3)))
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'number',
        minimum: 5,
      });
    });
  });
});
