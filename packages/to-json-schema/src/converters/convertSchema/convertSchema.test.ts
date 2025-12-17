import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { createContext } from '../../vitest/index.ts';
import { convertSchema } from './convertSchema.ts';

console.warn = vi.fn();

describe('convertSchema', () => {
  describe('definitions', () => {
    test('should convert schema using definitions', () => {
      const schema = v.string();
      expect(
        convertSchema(
          {},
          schema,
          undefined,
          createContext({
            definitions: { foo: { type: 'string' } },
            referenceMap: new Map().set(schema, 'foo'),
          })
        )
      ).toStrictEqual({
        $ref: '#/$defs/foo',
      });
    });

    test('should skip definition if specified', () => {
      const stringSchema = v.string();
      expect(
        convertSchema(
          {},
          stringSchema,
          undefined,
          createContext({
            definitions: { foo: { type: 'string' } },
            referenceMap: new Map().set(stringSchema, 'foo'),
          }),
          true
        )
      ).toStrictEqual({
        type: 'string',
      });
    });

    test('should not skip definition if specified', () => {
      const stringSchema = v.string();
      expect(
        convertSchema(
          {},
          stringSchema,
          undefined,
          createContext({
            definitions: { foo: { type: 'string' } },
            referenceMap: new Map().set(stringSchema, 'foo'),
          }),
          false
        )
      ).toStrictEqual({
        $ref: '#/$defs/foo',
      });
    });

    test('should skip only root definition of nested schema if specified', () => {
      const stringSchema = v.string();
      const arraySchema = v.array(stringSchema);
      const definitions = {
        string: { type: 'string' },
        array: {
          type: 'array',
          items: { $ref: '#/$defs/string' },
        },
      } as const;
      const referenceMap = new Map<v.GenericSchema, string>([
        [stringSchema, 'string'],
        [arraySchema, 'array'],
      ]);
      expect(
        convertSchema(
          {},
          arraySchema,
          undefined,
          createContext({ definitions, referenceMap }),
          true
        )
      ).toStrictEqual({
        type: 'array',
        items: { $ref: '#/$defs/string' },
      });
    });

    test('should override reference ID if specified', () => {
      const foo = v.string();
      const bar = v.number();
      const schema = v.object({ foo, bar });
      expect(
        convertSchema(
          {},
          schema,
          {
            overrideRef({ referenceId }) {
              if (referenceId === 'bar') {
                return '#/$custom/reference';
              }
            },
          },
          createContext({
            definitions: { foo: { type: 'string' }, bar: { type: 'number' } },
            referenceMap: new Map().set(foo, 'foo').set(bar, 'bar'),
          })
        )
      ).toStrictEqual({
        type: 'object',
        properties: {
          foo: { $ref: '#/$defs/foo' },
          bar: { $ref: '#/$custom/reference' },
        },
        required: ['foo', 'bar'],
      });
    });
  });

  describe('schema with pipe', () => {
    test('should convert pipe items', () => {
      expect(
        convertSchema(
          {},
          v.pipe(v.string(), v.email(), v.description('foo')),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        format: 'email',
        description: 'foo',
      });
    });

    test('should convert pipe schema in definitions', () => {
      const schema = v.string();
      expect(
        convertSchema(
          {},
          v.pipe(schema, v.email(), v.description('foo')),
          undefined,
          createContext({
            definitions: { foo: { type: 'string' } },
            referenceMap: new Map().set(schema, 'foo'),
          })
        )
      ).toStrictEqual({
        type: 'string',
        format: 'email',
        description: 'foo',
      });
    });

    test('should throw error for multiple schemas in pipe', () => {
      const schema = v.pipe(
        v.nullable(v.string()),
        v.string(),
        v.description('foo')
      );
      const error =
        'Set the "typeMode" config to "input" or "output" to convert pipelines with multiple schemas.';
      expect(() =>
        convertSchema({}, schema, undefined, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema, { errorMode: 'throw' }, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema, { typeMode: 'ignore' }, createContext())
      ).toThrowError(error);
    });

    test('should warn error for multiple schemas in pipe', () => {
      const schema = v.pipe(
        v.nullable(v.string()),
        v.string(),
        v.description('foo')
      );
      const error =
        'Set the "typeMode" config to "input" or "output" to convert pipelines with multiple schemas.';
      expect(
        convertSchema({}, schema, { errorMode: 'warn' }, createContext())
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
        type: 'string',
        description: 'foo',
      });
      expect(console.warn).toHaveBeenLastCalledWith(error);
      expect(
        convertSchema(
          {},
          schema,
          { errorMode: 'warn', typeMode: 'ignore' },
          createContext()
        )
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
        type: 'string',
        description: 'foo',
      });
      expect(console.warn).toHaveBeenLastCalledWith(error);
    });

    // Hint: This schema is intentionally complex to test the conversion of nested pipelines
    const inputOutputSchema = v.pipe(
      v.pipe(
        v.pipe(v.string(), v.nonEmpty()),
        v.decimal(),
        v.transform(Number),
        v.pipe(v.number(), v.minValue(0))
      ),
      v.maxValue(100)
    );

    test('should convert only input type of pipeline', () => {
      expect(
        convertSchema(
          {},
          // @ts-expect-error
          inputOutputSchema,
          { typeMode: 'input' },
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        minLength: 1,
        pattern: '^[+-]?(?:\\d*\\.)?\\d+$',
      });
    });

    test('should convert only output type of pipeline', () => {
      expect(
        convertSchema(
          {},
          // @ts-expect-error
          inputOutputSchema,
          { typeMode: 'output' },
          createContext()
        )
      ).toStrictEqual({
        type: 'number',
        minimum: 0,
        maximum: 100,
      });
    });
  });

  describe('primitive schemas', () => {
    test('should convert boolean schema', () => {
      expect(
        convertSchema({}, v.boolean(), undefined, createContext())
      ).toStrictEqual({
        type: 'boolean',
      });
    });

    test('should convert null schema', () => {
      expect(
        convertSchema({}, v.null(), undefined, createContext())
      ).toStrictEqual({
        type: 'null',
      });
    });

    test('should convert null schema for openapi-3.0', () => {
      expect(
        convertSchema({}, v.null_(), { target: 'openapi-3.0' }, createContext())
      ).toStrictEqual({
        enum: [null],
      });
    });

    test('should convert number schema', () => {
      expect(
        convertSchema({}, v.number(), undefined, createContext())
      ).toStrictEqual({
        type: 'number',
      });
    });

    test('should convert string schema', () => {
      expect(
        convertSchema({}, v.string(), undefined, createContext())
      ).toStrictEqual({
        type: 'string',
      });
    });
  });

  describe('complex schemas', () => {
    test('should convert array schema', () => {
      expect(
        convertSchema({}, v.array(v.number()), undefined, createContext())
      ).toStrictEqual({
        type: 'array',
        items: { type: 'number' },
      });
    });

    test('should convert tuple schema', () => {
      expect(
        convertSchema(
          {},
          v.tuple([v.number(), v.string()]),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: [{ type: 'number' }, { type: 'string' }],
        minItems: 2,
      });
    });

    test('should convert tuple schema for draft-2020-12', () => {
      expect(
        convertSchema(
          {},
          v.tuple([v.string(), v.number()]),
          { target: 'draft-2020-12' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        minItems: 2,
      });
    });

    test('should convert tuple schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.tuple([v.string(), v.number()]),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        },
        minItems: 2,
        maxItems: 2,
      });
    });

    test('should convert tuple with rest schema', () => {
      expect(
        convertSchema(
          {},
          v.tupleWithRest([v.number(), v.string()], v.boolean()),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: [{ type: 'number' }, { type: 'string' }],
        minItems: 2,
        additionalItems: { type: 'boolean' },
      });
    });

    test('should convert tuple with rest schema for draft-2020-12', () => {
      expect(
        convertSchema(
          {},
          v.tupleWithRest([v.string()], v.number()),
          { target: 'draft-2020-12' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        prefixItems: [{ type: 'string' }],
        minItems: 1,
        items: { type: 'number' },
      });
    });

    test('should convert tuple with rest schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.tupleWithRest([v.string()], v.number()),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        },
        minItems: 1,
      });
    });

    test('should convert loose tuple schema', () => {
      expect(
        convertSchema(
          {},
          v.looseTuple([v.number(), v.string()]),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: [{ type: 'number' }, { type: 'string' }],
        minItems: 2,
      });
    });

    test('should convert loose tuple schema for draft-2020-12', () => {
      expect(
        convertSchema(
          {},
          v.looseTuple([v.string(), v.number()]),
          { target: 'draft-2020-12' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        minItems: 2,
      });
    });

    test('should convert loose tuple schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.looseTuple([v.string(), v.number()]),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        },
        minItems: 2,
      });
    });

    test('should convert strict tuple schema', () => {
      expect(
        convertSchema(
          {},
          v.strictTuple([v.number(), v.string()]),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: [{ type: 'number' }, { type: 'string' }],
        minItems: 2,
        additionalItems: false,
      });
    });

    test('should convert strict tuple schema for draft-2020-12', () => {
      expect(
        convertSchema(
          {},
          v.strictTuple([v.string(), v.boolean()]),
          { target: 'draft-2020-12' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'boolean' }],
        minItems: 2,
        items: false,
      });
    });

    test('should convert strict tuple schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.strictTuple([v.string(), v.boolean()]),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'array',
        items: {
          anyOf: [{ type: 'string' }, { type: 'boolean' }],
        },
        minItems: 2,
        maxItems: 2,
      });
    });

    test('should convert object schema', () => {
      expect(
        convertSchema(
          {},
          v.object({
            key1: v.string(),
            key2: v.optional(v.string()),
            key3: v.boolean(),
            key4: v.exactOptional(v.boolean()),
            key5: v.number(),
            key6: v.nullish(v.number()),
          }),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        properties: {
          key1: { type: 'string' },
          key2: { type: 'string' },
          key3: { type: 'boolean' },
          key4: { type: 'boolean' },
          key5: { type: 'number' },
          key6: { anyOf: [{ type: 'number' }, { type: 'null' }] },
        },
        required: ['key1', 'key3', 'key5'],
      });
    });

    test('should convert object with rest schema', () => {
      expect(
        convertSchema(
          {},
          v.objectWithRest(
            {
              key1: v.string(),
              key2: v.optional(v.string()),
              key3: v.boolean(),
              key4: v.exactOptional(v.boolean()),
              key5: v.number(),
              key6: v.nullish(v.number()),
            },
            v.number()
          ),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        properties: {
          key1: { type: 'string' },
          key2: { type: 'string' },
          key3: { type: 'boolean' },
          key4: { type: 'boolean' },
          key5: { type: 'number' },
          key6: { anyOf: [{ type: 'number' }, { type: 'null' }] },
        },
        required: ['key1', 'key3', 'key5'],
        additionalProperties: { type: 'number' },
      });
    });

    test('should convert loose object schema', () => {
      expect(
        convertSchema(
          {},
          v.looseObject({
            key1: v.string(),
            key2: v.optional(v.string()),
            key3: v.boolean(),
            key4: v.exactOptional(v.boolean()),
            key5: v.number(),
            key6: v.nullish(v.number()),
          }),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        properties: {
          key1: { type: 'string' },
          key2: { type: 'string' },
          key3: { type: 'boolean' },
          key4: { type: 'boolean' },
          key5: { type: 'number' },
          key6: { anyOf: [{ type: 'number' }, { type: 'null' }] },
        },
        required: ['key1', 'key3', 'key5'],
      });
    });

    test('should convert strict object schema', () => {
      expect(
        convertSchema(
          {},
          v.strictObject({
            key1: v.string(),
            key2: v.optional(v.string()),
            key3: v.boolean(),
            key4: v.exactOptional(v.boolean()),
            key5: v.number(),
            key6: v.nullish(v.number()),
          }),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        properties: {
          key1: { type: 'string' },
          key2: { type: 'string' },
          key3: { type: 'boolean' },
          key4: { type: 'boolean' },
          key5: { type: 'number' },
          key6: { anyOf: [{ type: 'number' }, { type: 'null' }] },
        },
        required: ['key1', 'key3', 'key5'],
        additionalProperties: false,
      });
    });

    test('should convert record schema', () => {
      expect(
        convertSchema(
          {},
          v.record(v.string(), v.number()),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        propertyNames: { type: 'string' },
        additionalProperties: { type: 'number' },
      });
    });

    test('should convert record schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.record(v.string(), v.number()),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        additionalProperties: { type: 'number' },
      });
    });

    test('should convert record schema with pipe in key', () => {
      expect(
        convertSchema(
          {},
          v.record(v.pipe(v.string(), v.email()), v.number()),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'object',
        propertyNames: { type: 'string', format: 'email' },
        additionalProperties: { type: 'number' },
      });
    });

    test('should throw error for record with piped key schema for openapi-3.0', () => {
      const schema = v.record(v.pipe(v.string(), v.email()), v.number());
      const error =
        'The "record" schema with a schema for the key that contains a "pipe" cannot be converted to JSON Schema.';
      expect(() =>
        convertSchema({}, schema, { target: 'openapi-3.0' }, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema(
          {},
          schema,
          { target: 'openapi-3.0', errorMode: 'throw' },
          createContext()
        )
      ).toThrowError(error);
    });

    test('should throw error for record schema with non-string schema key', () => {
      // @ts-expect-error
      const schema = v.record(v.number(), v.number());
      const error =
        'The "record" schema with the "number" schema for the key cannot be converted to JSON Schema.';
      expect(() =>
        convertSchema({}, schema, undefined, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema, { errorMode: 'throw' }, createContext())
      ).toThrowError(error);
    });

    test('should warn error for record schema with non-string schema key', () => {
      // @ts-expect-error
      const schema = v.record(v.pipe(v.number(), v.minValue(10)), v.number());
      expect(
        convertSchema({}, schema, { errorMode: 'warn' }, createContext())
      ).toStrictEqual({
        type: 'object',
        propertyNames: { type: 'number', minimum: 10 },
        additionalProperties: { type: 'number' },
      });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The "record" schema with the "number" schema for the key cannot be converted to JSON Schema.'
      );
    });
  });

  describe('special schemas', () => {
    test('should convert any schema', () => {
      expect(
        convertSchema({}, v.any(), undefined, createContext())
      ).toStrictEqual({});
    });

    test('should convert unknown schema', () => {
      expect(
        convertSchema({}, v.unknown(), undefined, createContext())
      ).toStrictEqual({});
    });

    test('should convert nullable schema without default', () => {
      expect(
        convertSchema({}, v.nullable(v.string()), undefined, createContext())
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
      });
    });

    test('should convert nullable schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.nullable(v.string()),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        nullable: true,
      });
    });

    test('should convert nullable schema with default for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.nullable(v.string(), 'foo'),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        nullable: true,
        default: 'foo',
      });
    });

    test('should convert nullable schema with default', () => {
      expect(
        convertSchema(
          {},
          v.nullable(v.string(), 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
        default: 'foo',
      });
      expect(
        convertSchema(
          {},
          v.nullable(v.string(), () => 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
        default: 'foo',
      });
    });

    test('should convert nullish schema without default', () => {
      expect(
        convertSchema({}, v.nullish(v.string()), undefined, createContext())
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
      });
    });

    test('should convert nullish schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.nullish(v.number()),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'number',
        nullable: true,
      });
    });

    test('should convert nullish schema with default for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.nullish(v.number(), 42),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        type: 'number',
        nullable: true,
        default: 42,
      });
    });

    test('should convert nullish schema with default', () => {
      expect(
        convertSchema(
          {},
          v.nullish(v.string(), 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
        default: 'foo',
      });
      expect(
        convertSchema(
          {},
          v.nullable(v.string(), () => 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'null' }],
        default: 'foo',
      });
    });

    test('should convert exact optional schema without default', () => {
      expect(
        convertSchema(
          {},
          v.exactOptional(v.string()),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
      });
    });

    test('should convert exact optional schema with default', () => {
      expect(
        convertSchema(
          {},
          v.exactOptional(v.string(), 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        default: 'foo',
      });
      expect(
        convertSchema(
          {},
          v.exactOptional(v.string(), () => 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        default: 'foo',
      });
    });

    test('should convert optional schema without default', () => {
      expect(
        convertSchema({}, v.optional(v.string()), undefined, createContext())
      ).toStrictEqual({
        type: 'string',
      });
    });

    test('should convert optional schema with default', () => {
      expect(
        convertSchema(
          {},
          v.optional(v.string(), 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        default: 'foo',
      });
      expect(
        convertSchema(
          {},
          v.optional(v.string(), () => 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        default: 'foo',
      });
    });

    test('should convert undefinedable schema without default', () => {
      expect(
        convertSchema(
          {},
          v.undefinedable(v.string()),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
      });
    });

    test('should convert undefinedable schema with default', () => {
      expect(
        convertSchema(
          {},
          v.undefinedable(v.string(), 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        default: 'foo',
      });
      expect(
        convertSchema(
          {},
          v.undefinedable(v.string(), () => 'foo'),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        default: 'foo',
      });
    });

    test('should convert supported literal schema', () => {
      expect(
        convertSchema({}, v.literal(true), undefined, createContext())
      ).toStrictEqual({
        const: true,
      });
      expect(
        convertSchema({}, v.literal(123), undefined, createContext())
      ).toStrictEqual({
        const: 123,
      });
      expect(
        convertSchema({}, v.literal('foo'), undefined, createContext())
      ).toStrictEqual({
        const: 'foo',
      });
    });

    test('should convert literal schema for openapi-3.0', () => {
      expect(
        convertSchema(
          {},
          v.literal('test'),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        enum: ['test'],
      });
      expect(
        convertSchema(
          {},
          v.literal(42),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        enum: [42],
      });
      expect(
        convertSchema(
          {},
          v.literal(true),
          { target: 'openapi-3.0' },
          createContext()
        )
      ).toStrictEqual({
        enum: [true],
      });
    });

    test('should throw error for unsupported literal schema', () => {
      const schema1 = v.literal(123n);
      const schema2 = v.literal(Symbol('foo'));
      const error = 'The value of the "literal" schema is not JSON compatible.';
      expect(() =>
        convertSchema({}, schema1, undefined, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema1, { errorMode: 'throw' }, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema2, undefined, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema2, { errorMode: 'throw' }, createContext())
      ).toThrowError(error);
    });

    test('should warn error for unsupported literal schema', () => {
      expect(
        convertSchema(
          {},
          v.literal(123n),
          { errorMode: 'warn' },
          createContext()
        )
      ).toStrictEqual({
        const: 123n,
      });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The value of the "literal" schema is not JSON compatible.'
      );
      const symbol = Symbol('foo');
      expect(
        convertSchema(
          {},
          v.literal(symbol),
          { errorMode: 'warn' },
          createContext()
        )
      ).toStrictEqual({
        const: symbol,
      });
      expect(console.warn).toHaveBeenLastCalledWith(
        'The value of the "literal" schema is not JSON compatible.'
      );
    });

    test('should convert enum schema', () => {
      enum TestEnum {
        KEY1,
        KEY2,
        KEY3 = 'foo',
        KEY4 = 123,
      }
      expect(
        convertSchema(
          {},
          // @ts-expect-error
          v.enum(TestEnum),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        enum: [0, 1, 'foo', 123],
      });
    });

    test('should convert supported picklist schema', () => {
      expect(
        convertSchema(
          {},
          v.picklist(['foo', 123, 'bar', 456]),
          undefined,
          createContext()
        )
      ).toStrictEqual({ enum: ['foo', 123, 'bar', 456] });
    });

    test('should throw error for unsupported picklist schema', () => {
      const schema = v.picklist([123n, 456n]);
      const error =
        'An option of the "picklist" schema is not JSON compatible.';
      expect(() =>
        convertSchema({}, schema, undefined, createContext())
      ).toThrowError(error);
      expect(() =>
        convertSchema({}, schema, { errorMode: 'throw' }, createContext())
      ).toThrowError(error);
    });

    test('should warn error for unsupported picklist schema', () => {
      expect(
        convertSchema(
          {},
          v.picklist([123n, 456n]),
          { errorMode: 'warn' },
          createContext()
        )
      ).toStrictEqual({ enum: [123n, 456n] });
      expect(console.warn).toHaveBeenLastCalledWith(
        'An option of the "picklist" schema is not JSON compatible.'
      );
    });

    test('should convert union schema', () => {
      expect(
        convertSchema(
          {},
          v.union([v.string(), v.boolean()]),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        anyOf: [{ type: 'string' }, { type: 'boolean' }],
      });
    });

    test('should convert variant schema', () => {
      expect(
        convertSchema(
          {},
          v.variant('type', [
            v.object({ type: v.literal('foo'), foo: v.string() }),
            v.object({ type: v.literal('bar'), bar: v.number() }),
          ]),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        oneOf: [
          {
            type: 'object',
            properties: {
              type: { const: 'foo' },
              foo: { type: 'string' },
            },
            required: ['type', 'foo'],
          },
          {
            type: 'object',
            properties: {
              type: { const: 'bar' },
              bar: { type: 'number' },
            },
            required: ['type', 'bar'],
          },
        ],
      });
    });

    test('should convert intersect schema', () => {
      expect(
        convertSchema(
          {},
          v.intersect([
            v.object({ foo: v.string() }),
            v.object({ bar: v.number() }),
          ]),
          undefined,
          createContext()
        )
      ).toStrictEqual({
        allOf: [
          {
            type: 'object',
            properties: {
              foo: { type: 'string' },
            },
            required: ['foo'],
          },
          {
            type: 'object',
            properties: {
              bar: { type: 'number' },
            },
            required: ['bar'],
          },
        ],
      });
    });

    test('should convert simple lazy schema without definitions', () => {
      const stringSchema = v.string();
      const lazyGetter = () => stringSchema;
      const context = createContext();
      expect(
        convertSchema({}, v.lazy(lazyGetter), undefined, context)
      ).toStrictEqual({ $ref: '#/$defs/0' });
      expect(context).toStrictEqual({
        definitions: { '0': { type: 'string' } },
        referenceMap: new Map().set(stringSchema, '0'),
        getterMap: new Map().set(lazyGetter, stringSchema),
      });
    });

    test('should convert simple lazy schema with definitions', () => {
      const stringSchema = v.string();
      const lazyGetter = () => stringSchema;
      const context = createContext({
        definitions: { testSchema: { type: 'string' } },
        referenceMap: new Map().set(stringSchema, 'stringSchema'),
      });
      expect(
        convertSchema(
          {},
          v.lazy(lazyGetter),
          { definitions: { stringSchema } },
          context
        )
      ).toStrictEqual({ $ref: '#/$defs/stringSchema' });
      expect(context).toStrictEqual({
        definitions: { testSchema: { type: 'string' } },
        referenceMap: new Map().set(stringSchema, 'stringSchema'),
        getterMap: new Map().set(lazyGetter, stringSchema),
      });
    });

    test('should convert recursive lazy schema with static getter', () => {
      // Returns a static reference that never changes
      const lazyGetter = () => nodeSchema;
      const nodeSchema: v.GenericSchema = v.object({
        node: v.optional(v.lazy(lazyGetter)),
      });
      const context = createContext();
      expect(
        convertSchema(
          {},
          // @ts-expect-error
          nodeSchema,
          undefined,
          context
        )
      ).toStrictEqual({
        type: 'object',
        properties: { node: { $ref: '#/$defs/1' } },
        required: [],
      });
      expect(context).toStrictEqual({
        definitions: {
          '1': {
            type: 'object',
            properties: { node: { $ref: '#/$defs/1' } },
            required: [],
          },
        },
        referenceMap: new Map().set(nodeSchema, '1'),
        getterMap: new Map().set(lazyGetter, nodeSchema),
      });
    });

    test('should convert recursive lazy schema with dynamic getter', () => {
      // Returns a dynamic reference that always changes
      const lazyGetter = () => v.nullable(nodeSchema);
      const nodeSchema: v.GenericSchema = v.object({
        node: v.lazy(lazyGetter),
      });
      const context = createContext();
      expect(
        convertSchema(
          {},
          // @ts-expect-error
          nodeSchema,
          undefined,
          context
        )
      ).toStrictEqual({
        type: 'object',
        properties: { node: { $ref: '#/$defs/2' } },
        required: ['node'],
      });
      expect(context).toStrictEqual({
        definitions: {
          '2': {
            anyOf: [
              {
                type: 'object',
                properties: { node: { $ref: '#/$defs/2' } },
                required: ['node'],
              },
              { type: 'null' },
            ],
          },
        },
        referenceMap: new Map().set(expect.any(Object), '2'),
        getterMap: new Map().set(lazyGetter, expect.any(Object)),
      });
    });

    test('should convert simple lazy schema without custom reference ID', () => {
      const wrappedSchema = v.string();
      expect(
        convertSchema(
          {},
          v.lazy(() => wrappedSchema),
          {
            overrideRef({ valibotSchema }) {
              if (valibotSchema === wrappedSchema) {
                return '#/$custom/reference';
              }
            },
          },
          createContext()
        )
      ).toStrictEqual({ $ref: '#/$custom/reference' });
    });
  });

  describe('other schemas', () => {
    test('should throw error for unsupported file schema', () => {
      const schema = v.file();
      const error = 'The "file" schema cannot be converted to JSON Schema.';
      expect(() =>
        convertSchema(
          {},
          // @ts-expect-error
          schema,
          undefined,
          createContext()
        )
      ).toThrowError(error);
      expect(() =>
        convertSchema(
          {},
          // @ts-expect-error
          schema,
          { errorMode: 'throw' },
          createContext()
        )
      ).toThrowError(error);
    });

    test('should warn error for unsupported file schema', () => {
      expect(
        // @ts-expect-error
        convertSchema({}, v.file(), { errorMode: 'warn' }, createContext())
      ).toStrictEqual({});
      expect(console.warn).toHaveBeenLastCalledWith(
        'The "file" schema cannot be converted to JSON Schema.'
      );
    });
  });

  describe('custom config', () => {
    test('should override JSON Schema and suppress error', () => {
      expect(() =>
        convertSchema(
          {},
          // @ts-expect-error
          v.date(),
          { overrideSchema: () => null },
          createContext()
        )
      ).toThrowError('The "date" schema cannot be converted to JSON Schema.');
      expect(
        convertSchema(
          {},
          // @ts-expect-error
          v.date(),
          {
            overrideSchema({ valibotSchema }) {
              if (valibotSchema.type === 'date') {
                return { type: 'string', format: 'date-time' };
              }
            },
          },
          createContext()
        )
      ).toStrictEqual({
        type: 'string',
        format: 'date-time',
      });
    });
  });
});
