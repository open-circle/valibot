import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { string } from '../../schemas/index.ts';
import { cache2 } from './cache2.ts';

describe('cache2', () => {
  test('should cache output', () => {
    const baseSchema = string();
    const runSpy = vi.spyOn(baseSchema, '~run');
    const schema = cache2(baseSchema);
    expect(schema['~run']({ value: 'foo' }, {})).toBe(
      schema['~run']({ value: 'foo' }, {})
    );
    expect(runSpy).toHaveBeenCalledTimes(1);
  });

  test('should allow custom max size', () => {
    const schema = cache2(string(), { maxSize: 2 });
    expect(schema.cacheConfig.maxSize).toBe(2);

    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);

    expect(schema['~run']({ value: 'bar' }, {})).toBe(
      schema['~run']({ value: 'bar' }, {})
    );

    expect(schema['~run']({ value: 'baz' }, {})).toBe(
      schema['~run']({ value: 'baz' }, {})
    );

    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });

  describe('should allow custom max age', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', () => {
      const schema = cache2(string(), { maxAge: 1000 });

      const fooDataset = schema['~run']({ value: 'foo' }, {});
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1001);
      expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });

    test('and not reset expiry on get', () => {
      const schema = cache2(string(), { maxAge: 1000 });
      const fooDataset = schema['~run']({ value: 'foo' }, {});
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(500);
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(501);
      expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });
  });

  test('should expose cache for manual clearing', () => {
    const schema = cache2(string());
    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    schema.cache.clear();
    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
});
