import { describe, expect, test } from 'vitest';
import { _stringify } from './_stringify.ts';

describe('_stringify', () => {
  test('should return string literal', () => {
    expect(_stringify('hello')).toBe('"hello"');
  });

  test('should return number literal', () => {
    expect(_stringify(123)).toBe('123');
  });

  test('should return bigint literal', () => {
    expect(_stringify(123n)).toBe('123');
  });

  test('should return boolean literal', () => {
    expect(_stringify(true)).toBe('true');
    expect(_stringify(false)).toBe('false');
  });

  test('should return type of symbol', () => {
    expect(_stringify(Symbol('foo'))).toBe('symbol');
  });

  test('should return type of undefined', () => {
    expect(_stringify(undefined)).toBe('undefined');
  });

  test('should return Object constructor name', () => {
    expect(_stringify({})).toBe('Object');
  });

  test('should return Array constructor name', () => {
    expect(_stringify([])).toBe('Array');
  });

  test('should return Function constructor name', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(_stringify(() => {})).toBe('Function');
  });

  test('should return Date constructor name', () => {
    expect(_stringify(new Date())).toBe('Date');
  });

  test('should return Object as fallback if getPrototypeOf throws', () => {
    const input = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error('boom');
        },
      }
    );
    expect(_stringify(input)).toBe('Object');
  });

  test('should return null as string', () => {
    expect(_stringify(null)).toBe('null');
    expect(_stringify(Object.create(null))).toBe('null');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function EmptyObject() {}
    EmptyObject.prototype = Object.create(null);
    // @ts-expect-error
    const emptyObject = new EmptyObject();
    expect(_stringify(emptyObject)).toBe('null');
  });
});
