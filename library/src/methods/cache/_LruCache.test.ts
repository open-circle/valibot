import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { _LruCache } from './_LruCache.ts';

describe('_LruCache', () => {
  test('should create stable keys for the same input and config', () => {
    const cache = new _LruCache<unknown>();
    const input = { key: 'foo' };
    const config = { lang: 'de', abortEarly: true };

    expect(cache.key(input, config)).toBe(cache.key(input, config));
  });

  test('should create different keys for different configs', () => {
    const cache = new _LruCache<unknown>();

    expect(cache.key('foo', { lang: 'de' })).not.toBe(
      cache.key('foo', { lang: 'en' })
    );
  });

  test('should create different keys for different abort configs', () => {
    const cache = new _LruCache<unknown>();

    expect(cache.key('foo', {})).not.toBe(
      cache.key('foo', { abortEarly: true })
    );
  });

  test('should distinguish numbers and bigints', () => {
    const cache = new _LruCache<unknown>();

    expect(cache.key(1, {})).not.toBe(cache.key(1n, {}));
  });

  test('should handle null input', () => {
    const cache = new _LruCache<unknown>();

    expect(cache.key(null, {})).toContain('null');
  });

  test('should include symbol type for symbol input', () => {
    const cache = new _LruCache<unknown>();

    expect(cache.key(Symbol('foo'), {})).toBe(
      'symbol|undefined|undefined|undefined|undefined'
    );
  });

  test('should create different keys for different object references', () => {
    const cache = new _LruCache<unknown>();

    expect(cache.key({}, {})).not.toBe(cache.key({}, {}));
  });

  test('should return undefined on cache miss', () => {
    const cache = new _LruCache<string>();

    expect(cache.get('foo')).toBeUndefined();
  });

  test('should get stored values by key', () => {
    const cache = new _LruCache<string>();

    cache.set('foo', 'bar');

    expect(cache.get('foo')).toBe('bar');
  });

  test('should clear stored values', () => {
    const cache = new _LruCache<string>();

    cache.set('foo', 'bar');
    cache.clear();

    expect(cache.get('foo')).toBeUndefined();
  });

  describe('should allow custom max age', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', () => {
      const cache = new _LruCache<string>({ maxAge: 1000 });

      cache.set('foo', 'bar');
      expect(cache.get('foo')).toBe('bar');
      vi.advanceTimersByTime(1001);
      expect(cache.get('foo')).toBeUndefined();
    });

    test('and not reset expiry on get', () => {
      const cache = new _LruCache<string>({ maxAge: 1000 });

      cache.set('foo', 'bar');
      expect(cache.get('foo')).toBe('bar');
      vi.advanceTimersByTime(500);
      expect(cache.get('foo')).toBe('bar');
      vi.advanceTimersByTime(501);
      expect(cache.get('foo')).toBeUndefined();
    });
  });

  test('should evict oldest key when max size is exceeded', () => {
    const cache = new _LruCache<string>({ maxSize: 2 });

    cache.set('foo', 'foo');
    cache.set('bar', 'bar');
    cache.set('baz', 'baz');

    expect(cache.get('foo')).toBeUndefined();
    expect(cache.get('bar')).toBe('bar');
    expect(cache.get('baz')).toBe('baz');
  });
});
