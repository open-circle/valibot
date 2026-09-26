import { describe, expect, test } from 'vitest';
import { _isConstructorPrototype, _isPlainObject } from './_isPlainObject.ts';

describe('_isPlainObject', () => {
  test('should return true for an object literal', () => {
    expect(_isPlainObject({})).toBe(true);
    expect(_isPlainObject({ key: 'value' })).toBe(true);
  });

  test('should return true for an object created with Object.create(null)', () => {
    expect(_isPlainObject(Object.create(null))).toBe(true);
  });

  test('should return true for a plain-shaped cross-realm-like object', () => {
    const proto = Object.create(null);
    expect(_isPlainObject(Object.create(proto))).toBe(true);
  });

  test('should return false for a class instance', () => {
    class Foo {
      bar = 1;
    }
    expect(_isPlainObject(new Foo())).toBe(false);
  });

  test('should return false for a Date', () => {
    expect(_isPlainObject(new Date())).toBe(false);
  });

  test('should return true for a built-in prototype, since it is plain-shaped one hop up', () => {
    // Hint: `_isPlainArray` relies on this for ordinary arrays. See the
    // hint on `_isPlainObject` itself.
    expect(_isPlainObject(Array.prototype)).toBe(true);
    expect(_isPlainObject(Date.prototype)).toBe(true);
  });

  test('should return false if input itself has a throwing getPrototypeOf trap', () => {
    const input = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error('boom');
        },
      }
    );
    expect(_isPlainObject(input)).toBe(false);
  });
});

describe('_isConstructorPrototype', () => {
  test('should return false for an object literal', () => {
    expect(_isConstructorPrototype({})).toBe(false);
    expect(_isConstructorPrototype({ key: 'value' })).toBe(false);
  });

  test('should return false for an object with its own unrelated constructor key', () => {
    expect(_isConstructorPrototype({ constructor: 'not a function' })).toBe(
      false
    );
  });

  test('should return false for an object created with Object.create(null)', () => {
    expect(_isConstructorPrototype(Object.create(null))).toBe(false);
  });

  test('should return true for a built-in prototype', () => {
    expect(_isConstructorPrototype(Date.prototype)).toBe(true);
    expect(_isConstructorPrototype(Map.prototype)).toBe(true);
    expect(_isConstructorPrototype(Array.prototype)).toBe(true);
    expect(_isConstructorPrototype(Object.prototype)).toBe(true);
  });

  test('should return true for a plain class prototype', () => {
    class Foo {
      bar = 1;
    }
    expect(_isConstructorPrototype(Foo.prototype)).toBe(true);
  });

  test('should return false for an instance of a class', () => {
    class Foo {
      bar = 1;
    }
    expect(_isConstructorPrototype(new Foo())).toBe(false);
  });

  test('should return true if reading the constructor descriptor throws', () => {
    const input = new Proxy(
      {},
      {
        getOwnPropertyDescriptor() {
          throw new Error('boom');
        },
      }
    );
    expect(_isConstructorPrototype(input)).toBe(true);
  });

  test('should return false for a plain object with a throwing non-enumerable constructor getter', () => {
    const input: object = {};
    Object.defineProperty(input, 'constructor', {
      enumerable: false,
      configurable: true,
      get() {
        throw new Error('boom');
      },
    });
    expect(_isConstructorPrototype(input)).toBe(false);
  });
});
