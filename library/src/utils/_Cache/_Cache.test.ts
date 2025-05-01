import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { _Cache } from './_Cache.ts';

describe('_Cache', () => {
  test('should cache values', () => {
    const cache = new _Cache<string, number>();

    cache.set('foo', 123);
    expect(cache.get('foo')).toBe(123);

    cache.set('bar', 456);

    expect(cache.get('bar')).toBe(456);
    // default max size is 1
    expect(cache.get('foo')).toBeUndefined();
  });
  test('should allow deleting', () => {
    const cache = new _Cache<string, number>();

    cache.set('foo', 123);

    cache.set('bar', 456);

    cache.delete('foo');

    expect(cache.get('foo')).toBeUndefined();
    expect(cache.get('bar')).toBe(456);
  });
  test('should allow clearing', () => {
    const cache = new _Cache<string, number>();
    cache.set('foo', 123).set('bar', 456);

    cache.clear();

    expect(cache.get('foo')).toBeUndefined();
    expect(cache.get('bar')).toBeUndefined();
  });
  test('should allow checking', () => {
    const cache = new _Cache<string, number>();

    cache.set('foo', 123);

    expect(cache.has('foo')).toBe(true);
    expect(cache.has('bar')).toBe(false);
  });
  test('should allow getting size', () => {
    const cache = new _Cache<string, number>({ maxSize: 2 });

    cache.set('foo', 123).set('bar', 456);

    expect(cache.size).toBe(2);
  });
  test('should allow custom max size', () => {
    const cache = new _Cache<string, number>({ maxSize: 2 });

    cache.set('foo', 123);

    cache.set('bar', 456);

    cache.set('baz', 789);

    expect(cache.get('foo')).toBeUndefined();
    expect(cache.get('bar')).toBe(456);
    expect(cache.get('baz')).toBe(789);
  });

  describe('should allow custom duration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', () => {
      const cache = new _Cache<string, number>({ duration: 1000 });

      cache.set('foo', 123);
      expect(cache.get('foo')).toBe(123);

      vi.advanceTimersByTime(1001);
      expect(cache.get('foo')).toBeUndefined();
    });

    test('and reset expiry on get and has', () => {
      const cache = new _Cache<string, number>({ duration: 1000 });

      cache.set('foo', 123);
      expect(cache.get('foo')).toBe(123);

      vi.advanceTimersByTime(501);
      expect(cache.get('foo')).toBe(123);

      vi.advanceTimersByTime(501);
      expect(cache.has('foo')).toBe(true);

      vi.advanceTimersByTime(1001);
      expect(cache.has('foo')).toBe(false);
    });
  });
});
