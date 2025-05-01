import { setTimeout } from 'node:timers/promises';
import QuickLRU from 'quick-lru';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { string } from '../../schemas/index.ts';
import { cache } from './cache.ts';

describe('cache', () => {
  test('should cache output', () => {
    const baseSchema = string();
    const runSpy = vi.spyOn(baseSchema, '~run');
    const schema = cache(baseSchema);
    expect(schema['~run']({ value: 'foo' }, {})).toBe(
      schema['~run']({ value: 'foo' }, {})
    );
    expect(runSpy).toHaveBeenCalledTimes(1);
  });
  test('should allow custom max size', async () => {
    const schema = cache(string(), { maxSize: 2 });
    expect(schema.options.maxSize).toBe(2);

    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);

    // wait for next tick, to prevent same millisecond
    await setTimeout(0);
    expect(schema['~run']({ value: 'bar' }, {})).toBe(
      schema['~run']({ value: 'bar' }, {})
    );

    await setTimeout(0);
    expect(schema['~run']({ value: 'baz' }, {})).toBe(
      schema['~run']({ value: 'baz' }, {})
    );

    await setTimeout(0);
    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
  describe('should allow custom duration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', () => {
      const schema = cache(string(), { duration: 1000 });
      const fooDataset = schema['~run']({ value: 'foo' }, {});
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1001);
      expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });

    test('and reset expiry on get', () => {
      const schema = cache(string(), { duration: 1000 });
      const fooDataset = schema['~run']({ value: 'foo' }, {});
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(500);
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1001);
      expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });
  });
  test('should expose cache for manual clearing', () => {
    const schema = cache(string());
    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    schema.cache.clear();
    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
  test('should allow custom cache instance', () => {
    const schema = cache(string(), {
      cache: new QuickLRU({ maxSize: 1000 }),
    });
    expect(schema.cache).toBeInstanceOf(QuickLRU);

    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);

    schema.cache.clear();
    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
});
