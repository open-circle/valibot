import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { string } from '../../schemas/index.ts';
import { cacheAsync } from './cacheAsync.ts';

describe('cacheAsync', () => {
  test('should cache output', async () => {
    const baseSchema = string();
    const runSpy = vi.spyOn(baseSchema, '~run');
    const schema = cacheAsync(baseSchema);
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(
      await schema['~run']({ value: 'foo' }, {})
    );
    expect(runSpy).toHaveBeenCalledTimes(1);
  });
  test('should allow custom max size', async () => {
    const schema = cacheAsync(string(), { maxSize: 2 });
    expect(schema.options.maxSize).toBe(2);

    const fooDataset = await schema['~run']({ value: 'foo' }, {});
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    expect(await schema['~run']({ value: 'bar' }, {})).toBe(
      await schema['~run']({ value: 'bar' }, {})
    );
    expect(await schema['~run']({ value: 'baz' }, {})).toBe(
      await schema['~run']({ value: 'baz' }, {})
    );
    expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
  describe('should allow custom duration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', async () => {
      const schema = cacheAsync(string(), { duration: 1000 });
      const fooDataset = await schema['~run']({ value: 'foo' }, {});
      expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1000);
      expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });

    test('and reset expiry on get', async () => {
      const schema = cacheAsync(string(), { duration: 1000 });
      const fooDataset = await schema['~run']({ value: 'foo' }, {});
      expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(500);
      expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1000);
      expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });
  });
  test('should expose cache for manual clearing', async () => {
    const schema = cacheAsync(string());
    const fooDataset = await schema['~run']({ value: 'foo' }, {});
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    schema.cache.clear();
    expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
  test('should allow custom cache instance', async () => {
    const schema = cacheAsync(string(), {
      cache: new Map(),
    });
    expect(schema.cache).toBeInstanceOf(Map);

    const fooDataset = await schema['~run']({ value: 'foo' }, {});
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);

    schema.cache.clear();
    expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
});
