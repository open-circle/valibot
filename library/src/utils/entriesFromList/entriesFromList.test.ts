import { describe, expect, test } from 'vitest';
import { arrayAsync, string } from '../../schemas/index.ts';
import { entriesFromList } from './entriesFromList.ts';

describe('entriesFromList', () => {
  describe('should return object entries', () => {
    const symbol = Symbol();

    test('for sync schemas', () => {
      const schema = string();
      expect(entriesFromList(['foo', 123, symbol], schema)).toStrictEqual({
        foo: schema,
        [123]: schema,
        [symbol]: schema,
      });
    });

    test('for async schemas', () => {
      const schema = arrayAsync(string());
      expect(entriesFromList(['foo', 123, symbol], schema)).toStrictEqual({
        foo: schema,
        [123]: schema,
        [symbol]: schema,
      });
    });

    test('for __proto__ key without prototype pollution', () => {
      const schema = string();
      const entries = entriesFromList(['__proto__', 'foo'], schema);
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
      expect(entries.foo).toBe(schema);
    });
  });
});
