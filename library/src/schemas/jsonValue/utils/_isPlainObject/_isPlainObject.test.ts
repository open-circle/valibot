import { describe, expect, test } from 'vitest';
import { _isPlainObject } from './_isPlainObject.ts';

describe('_isPlainObject', () => {
  test('should return true for object literals', () => {
    expect(_isPlainObject({})).toBe(true);
    expect(_isPlainObject({ key: 'value' })).toBe(true);
  });

  test('should return true for object with null prototype', () => {
    expect(_isPlainObject(Object.create(null))).toBe(true);
  });

  test('should return true for plain-shaped cross-realm-like object', () => {
    const proto = Object.create(null);
    expect(_isPlainObject(Object.create(proto))).toBe(true);
  });

  test('should return false for class instance', () => {
    class Foo {
      bar = 1;
    }
    expect(_isPlainObject(new Foo())).toBe(false);
  });

  test('should return false for built-in instances', () => {
    expect(_isPlainObject(new Date())).toBe(false);
    expect(_isPlainObject(new Map())).toBe(false);
    expect(_isPlainObject(new Set())).toBe(false);
  });
});
