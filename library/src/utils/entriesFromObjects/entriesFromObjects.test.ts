import { describe, expect, test } from 'vitest';
import {
  boolean,
  number,
  object,
  objectAsync,
  string,
} from '../../schemas/index.ts';
import { entriesFromObjects } from './entriesFromObjects.ts';

describe('entriesFromObjects', () => {
  describe('should return objects entries', () => {
    const schema1 = object({ foo: string(), bar: string() });
    const schema2 = objectAsync({ baz: number(), qux: number() });
    const schema3 = object({ foo: boolean(), baz: boolean() });

    test('for missing schema', () => {
      expect(
        // @ts-expect-error
        entriesFromObjects([])
      ).toStrictEqual({});
    });

    test('for single schema', () => {
      expect(entriesFromObjects([schema1])).toStrictEqual(schema1.entries);
    });

    test('for multiple schemes', () => {
      expect(entriesFromObjects([schema1, schema2])).toStrictEqual({
        ...schema1.entries,
        ...schema2.entries,
      });
    });

    test('with overwrites', () => {
      expect(entriesFromObjects([schema1, schema2, schema3])).toStrictEqual({
        ...schema1.entries,
        ...schema2.entries,
        ...schema3.entries,
      });
    });

    test('for empty entries', () => {
      expect(entriesFromObjects([object({})])).toStrictEqual({});
      expect(entriesFromObjects([object({}), objectAsync({})])).toStrictEqual(
        {}
      );
    });

    test('for schemas with __proto__ key without prototype pollution', () => {
      const protoEntries = {};
      const schema = string();
      Object.defineProperty(protoEntries, '__proto__', {
        value: schema,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      const protoSchema = object(protoEntries);
      const entries = entriesFromObjects([protoSchema, schema1]);
      expect(Object.getPrototypeOf(entries)).toBe(Object.prototype);
      expect(Object.prototype.hasOwnProperty.call(entries, '__proto__')).toBe(
        true
      );
      expect(
        Object.getOwnPropertyDescriptor(entries, '__proto__')
      ).toStrictEqual({
        value: schema,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      expect(entries.foo).toBe(schema1.entries.foo);
      expect(entries.bar).toBe(schema1.entries.bar);
    });

    test('for schemas with symbol keys', () => {
      const symbol = Symbol('test');
      const schemaWithSymbol = object({ [symbol]: string() });
      const entries = entriesFromObjects([schemaWithSymbol, schema1]);
      expect(entries[symbol]).toBe(schemaWithSymbol.entries[symbol]);
      expect(entries.foo).toBe(schema1.entries.foo);
      expect(entries.bar).toBe(schema1.entries.bar);
    });

    test('without copying non-enumerable properties', () => {
      const nonEnumEntries = {};
      Object.defineProperty(nonEnumEntries, 'nonEnum', {
        value: string(),
        enumerable: false,
        configurable: true,
      });
      const nonEnumSchema = object(nonEnumEntries);
      const entries = entriesFromObjects([nonEnumSchema, schema1]);
      expect('nonEnum' in entries).toBe(false);
      expect(entries.foo).toBe(schema1.entries.foo);
      expect(entries.bar).toBe(schema1.entries.bar);
    });
  });
});
