import { describe, expect, test } from 'vitest';
import { fallback } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { any } from '../any/index.ts';
import { boolean } from '../boolean/index.ts';
import { exactOptional } from '../exactOptional/exactOptional.ts';
import { nullish } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { optional } from '../optional/index.ts';
import { string } from '../string/index.ts';
import { unknown } from '../unknown/index.ts';
import { object, type ObjectSchema } from './object.ts';
import type { ObjectIssue } from './types.ts';

describe('object', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;
    const baseSchema: Omit<ObjectSchema<Entries, never>, 'message'> = {
      kind: 'schema',
      type: 'object',
      reference: object,
      expects: 'Object',
      entries,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: ObjectSchema<Entries, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(object(entries)).toStrictEqual(schema);
      expect(object(entries, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(object(entries, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies ObjectSchema<Entries, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(object(entries, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies ObjectSchema<Entries, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', () => {
      expectNoSchemaIssue(object({}), [{}]);
    });

    test('for simple object', () => {
      expectNoSchemaIssue(object({ key1: string(), key2: number() }), [
        { key1: 'foo', key2: 123 },
      ]);
    });

    test('for unknown entries', () => {
      expect(
        object({ key1: string() })['~run'](
          { value: { key1: 'foo', key2: 123, key3: null } },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo' },
      });
    });

    test('for declared __proto__ key without prototype pollution', () => {
      const schema = object({
        ['__proto__']: object({
          isAdmin: boolean(),
        }),
      });
      const input = JSON.parse('{"__proto__":{"isAdmin":true}}');
      const dataset = schema['~run']({ value: input }, {});
      expect(dataset).toStrictEqual({
        typed: true,
        value: { ['__proto__']: { isAdmin: true } },
      });
      expect(Object.getPrototypeOf(dataset.value)).toBe(Object.prototype);
      expect(
        Object.prototype.hasOwnProperty.call(dataset.value, '__proto__')
      ).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(dataset.value, '__proto__')
      ).toStrictEqual({
        value: { isAdmin: true },
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    test('for declared __proto__ key with fallback', () => {
      const schema = object({
        ['__proto__']: fallback(
          object({
            isAdmin: boolean(),
          }),
          { isAdmin: true }
        ),
      });
      const dataset = schema['~run']({ value: {} }, {});
      expect(dataset).toStrictEqual({
        typed: true,
        value: { ['__proto__']: { isAdmin: true } },
      });
      expect(Object.getPrototypeOf(dataset.value)).toBe(Object.prototype);
      expect(
        Object.prototype.hasOwnProperty.call(dataset.value, '__proto__')
      ).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(dataset.value, '__proto__')
      ).toStrictEqual({
        value: { isAdmin: true },
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    test('for declared __proto__, constructor, and toString with defaults', () => {
      const schema = object({
        ['__proto__']: optional(string(), 'default_proto'),
        constructor: optional(string(), 'default_constructor'),
        toString: optional(string(), 'default_toString'),
      });
      const dataset = schema['~run']({ value: {} }, {});
      expect(dataset).toStrictEqual({
        typed: true,
        value: {
          ['__proto__']: 'default_proto',
          constructor: 'default_constructor',
          toString: 'default_toString',
        },
      });
      expect(Object.getPrototypeOf(dataset.value)).toBe(Object.prototype);
      expect(
        Object.prototype.hasOwnProperty.call(dataset.value, '__proto__')
      ).toBe(true);
    });

    test('for declared constructor and toString with fallback', () => {
      const schema = object({
        constructor: fallback(string(), 'fallback_constructor'),
        toString: fallback(string(), 'fallback_toString'),
      });
      const dataset = schema['~run']({ value: {} }, {});
      expect(dataset).toStrictEqual({
        typed: true,
        value: {
          constructor: 'fallback_constructor',
          toString: 'fallback_toString',
        },
      });
    });

    test('for valid own constructor, toString, and __proto__ entries', () => {
      const schema = object({
        ['__proto__']: string(),
        constructor: string(),
        toString: string(),
      });
      const input = JSON.parse(
        '{"__proto__":"custom_proto","constructor":"custom_constructor","toString":"custom_toString"}'
      );
      const dataset = schema['~run']({ value: input }, {});
      expect(dataset).toStrictEqual({
        typed: true,
        value: {
          ['__proto__']: 'custom_proto',
          constructor: 'custom_constructor',
          toString: 'custom_toString',
        },
      });
      expect(Object.getPrototypeOf(dataset.value)).toBe(Object.prototype);
      expect(
        Object.prototype.hasOwnProperty.call(dataset.value, '__proto__')
      ).toBe(true);
    });

    test('for class instances with own properties', () => {
      class TestClass {
        foo: string = 'bar';
        num: number = 123;
      }
      const instance = new TestClass();
      const schema = object({ foo: string(), num: number() });
      expect(schema['~run']({ value: instance }, {})).toStrictEqual({
        typed: true,
        value: { foo: 'bar', num: 123 },
      });
    });

    test('for object with own getter', () => {
      const input = {};
      Object.defineProperty(input, 'getter', {
        get: () => 'foo',
        enumerable: true,
      });
      const schema = object({ getter: string() });
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: true,
        value: { getter: 'foo' },
      });
    });
  });

  describe('should return dataset with issues', () => {
    const schema = object({}, 'message');
    const baseIssue: Omit<ObjectIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'object',
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
      expectSchemaIssue(schema, baseIssue, ['', 'abc', '123']);
    });

    test('for symbols', () => {
      expectSchemaIssue(schema, baseIssue, [Symbol(), Symbol('foo')]);
    });

    // Complex types

    // TODO: Enable this test again in case we find a reliable way to check for
    // plain objects
    // test('for arrays', () => {
    //   expectSchemaIssue(schema, baseIssue, [[], ['value']]);
    // });

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
    });
  });

  describe('should return dataset without nested issues', () => {
    test('for simple object', () => {
      expectNoSchemaIssue(object({ key1: string(), key2: number() }), [
        { key1: 'foo', key2: 123 },
      ]);
    });

    test('for nested object', () => {
      expectNoSchemaIssue(object({ nested: object({ key: string() }) }), [
        { nested: { key: 'foo' } },
      ]);
    });

    test('for missing entries with fallback', () => {
      expect(
        object({
          key1: fallback(string(), 'foo'),
          key2: fallback(number(), () => 123),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo', key2: 123 },
      });
    });

    test('for exact optional entry', () => {
      expectNoSchemaIssue(object({ key: exactOptional(string()) }), [
        {},
        { key: 'foo' },
      ]);
    });

    test('for exact optional entry with default', () => {
      expect(
        object({ key: exactOptional(string(), 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        object({ key: exactOptional(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
    });

    test('for optional entry', () => {
      expectNoSchemaIssue(object({ key: optional(string()) }), [
        {},
        { key: undefined },
        { key: 'foo' },
      ]);
    });

    test('for optional entry with default', () => {
      expect(
        object({ key: optional(string(), 'foo') })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        object({ key: optional(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        object({
          key: optional(string(), () => undefined),
        })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });

    test('for nullish entry', () => {
      expectNoSchemaIssue(object({ key: nullish(number()) }), [
        {},
        { key: undefined },
        { key: null },
        { key: 123 },
      ]);
    });

    test('for nullish entry with default', () => {
      expect(
        object({ key: nullish(string(), 'foo') })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        object({ key: nullish(string(), null) })['~run']({ value: {} }, {})
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        object({ key: nullish(string(), () => 'foo') })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: 'foo' },
      });
      expect(
        object({ key: nullish(string(), () => null) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: null },
      });
      expect(
        object({ key: nullish(string(), () => undefined) })['~run'](
          { value: {} },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key: undefined },
      });
    });

    test('for unknown entries', () => {
      expect(
        object({ key1: string() })['~run'](
          { value: { key1: 'foo', key2: 123, key3: null } },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo' },
      });
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = object({
      key1: string(),
      key2: number(),
      nested: object({ key1: string(), key2: number() }),
    });

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for missing entries', () => {
      const input = { key2: 123 };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'key1',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"nested"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'nested',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing nested entries', () => {
      const input = { key1: 'value', nested: {} };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'key2',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: {},
              },
              {
                type: 'object',
                origin: 'key',
                input: input.nested,
                key: 'key1',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: {},
              },
              {
                type: 'object',
                origin: 'key',
                input: input.nested,
                key: 'key2',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing entries with abort early', () => {
      const input = { key2: 123 };
      expect(
        schema['~run']({ value: input }, { abortEarly: true })
      ).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'key1',
                value: undefined,
              },
            ],
            abortEarly: true,
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing any and unknown entry', () => {
      const schema = object({ key1: any(), key2: unknown() });
      expect(schema['~run']({ value: {} }, {})).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key1"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input: {},
                key: 'key1',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"key2"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input: {},
                key: 'key2',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for missing constructor, toString, and __proto__ entries', () => {
      const missingSchema = object({
        constructor: string(),
        toString: string(),
        ['__proto__']: string(),
      });
      const input = {};
      expect(missingSchema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"constructor"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'constructor',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"toString"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'toString',
                value: undefined,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"__proto__"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: '__proto__',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof missingSchema>>);
    });

    test('for class instance with inherited getter treated as missing', () => {
      class BaseClass {
        ownProp: string = 'foo';
        get inheritedGetter(): string {
          return `${this.ownProp}_getter`;
        }
      }
      const instance = new BaseClass();
      const instanceSchema = object({
        ownProp: string(),
        inheritedGetter: string(),
      });
      expect(instanceSchema['~run']({ value: instance }, {})).toStrictEqual({
        typed: false,
        value: { ownProp: 'foo' },
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"inheritedGetter"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input: instance as unknown as Record<string, unknown>,
                key: 'inheritedGetter',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof instanceSchema>>);
    });

    test('for object inheriting properties via prototype treated as missing', () => {
      const proto = { inherited: 'foo' };
      const input = Object.create(proto);
      input.own = 'bar';
      const inheritedSchema = object({
        own: string(),
        inherited: string(),
      });
      expect(inheritedSchema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: '"inherited"',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'key',
                input,
                key: 'inherited',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof inheritedSchema>>);
    });

    test('for invalid entries', () => {
      const input = { key1: false, key2: 123, nested: null };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: false,
            expected: 'string',
            received: 'false',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key1',
                value: false,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: null,
            expected: 'Object',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: null,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid nested entries', () => {
      const input = {
        key1: 'value',
        key2: 'value',
        nested: {
          key1: 123,
          key2: null,
        },
      };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: 'value',
            expected: 'number',
            received: '"value"',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key2',
                value: input.key2,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: 123,
            expected: 'string',
            received: '123',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: input.nested,
              },
              {
                type: 'object',
                origin: 'value',
                input: input.nested,
                key: 'key1',
                value: input.nested.key1,
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: null,
            expected: 'number',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: input.nested,
              },
              {
                type: 'object',
                origin: 'value',
                input: input.nested,
                key: 'key2',
                value: input.nested.key2,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid entries with abort early', () => {
      const input = { key1: false, key2: 123, nested: null };
      expect(
        schema['~run']({ value: input }, { abortEarly: true })
      ).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: false,
            expected: 'string',
            received: 'false',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key1',
                value: false,
              },
            ],
            abortEarly: true,
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for invalid exact optional entry', () => {
      const schema = object({ key: exactOptional(string()) });
      const input = { key: undefined };
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: undefined,
            expected: 'string',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'key',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });
  });
});
